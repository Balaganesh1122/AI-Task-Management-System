import requests
import os
import json
import re
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

# Initialize LLM for drafting the email content
llm = ChatGroq(
    model_name="llama-3.1-8b-instant",
    temperature=0.3,
    max_tokens=300,
    groq_api_key=os.getenv("GROQ_API_KEY")
)

def generate_ai_email_content(employee, task, formatted_due_date):
    """Uses the LLM to draft a professional email subject and body without duplicate signatures."""
    prompt = f"""
You are an engineering manager's AI assistant. Draft a professional task assignment email body.
IMPORTANT: Do NOT include any sign-off, closing, or signature (like "Best regards" or "[Your Name]") at the end of your body, as a formal signature is already appended by the system template.

Employee Name: {employee.get('name')}
Designation: {employee.get('designation')}
Task Name: {task.get('task_name')}
Description: {task.get('description', 'No description provided')}
Category: {task.get('category', 'General')}
Priority: {task.get('priority', 'Normal')}
Due Date: {formatted_due_date}

Return ONLY valid JSON with two keys: "subject" and "body". Do not use unescaped line breaks inside strings. Do not wrap in markdown tags.
{{
    "subject": "Email Subject Line Here",
    "body": "Detailed email body text addressing the employee professionally, explaining the task objectives, expectations, and deadlines. Do not add a sign-off."
}}
"""
    try:
        response = llm.invoke(prompt)
        clean_res = response.content.replace("```json", "").replace("```", "").strip()
        
        try:
            return json.loads(clean_res, strict=False)
        except json.JSONDecodeError:
            cleaned = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', clean_res)
            return json.loads(cleaned, strict=False)
            
    except Exception as e:
        print(f"⚠️ LLM failed to draft email, using fallback template: {e}")
        return {
            "subject": f"New Task Assigned: {task.get('task_name')}",
            "body": f"Hello {employee.get('name')},\n\nYou have been assigned a new task: {task.get('task_name')}.\n\nDescription: {task.get('description')}\nDue Date: {formatted_due_date}"
        }

def send_task_email(employee, task):
    url = "https://api.emailjs.com/api/v1.0/email/send"

    service_id = os.getenv("EMAILJS_SERVICE_ID")
    template_id = os.getenv("EMAILJS_TEMPLATE_ID")
    public_key = os.getenv("EMAILJS_PUBLIC_KEY")
    private_key = os.getenv("EMAILJS_PRIVATE_KEY") 

    # 1. Handle Due Date fallback to "ASAP" if missing or not specified
    raw_due_date = task.get("due_date")
    if not raw_due_date or str(raw_due_date).strip().lower() in ["not specified", "none", "", "null", "n/a"]:
        formatted_due_date = "ASAP"
    else:
        formatted_due_date = str(raw_due_date)

    # 2. Generate intelligent email content via LLM
    print("🤖 Generating AI-customized email content via LLM...")
    ai_email = generate_ai_email_content(employee, task, formatted_due_date)

    # 3. Map all data securely to EmailJS template variables
    payload = {
        "service_id": service_id,
        "template_id": template_id,
        "user_id": public_key,
        "accessToken": private_key,
        "template_params": {
            "to_email": employee.get("email"),
            "to_name": employee.get("name"),
            "subject": ai_email.get("subject"),
            "message_body": ai_email.get("body"),
            "task_name": task.get("task_name"),
            "priority": task.get("priority", "Normal"),
            "due_date": formatted_due_date,
            "category": task.get("category", "General"),
            "description": task.get("description", "No description provided.")
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print(f"✉️  AI-generated email sent successfully to {employee['name']} ({employee['email']})")
            return True
        else:
            print(f"❌ Failed to send email. Status: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error connecting to EmailJS: {e}")
        return False