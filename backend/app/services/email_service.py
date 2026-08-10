from datetime import datetime


# =========================================================
# SEND EMAIL
# =========================================================

def send_email(email):

    return {
        "message": "Email queued successfully",
        "to": email.to,
        "subject": email.subject,
        "body": email.body,
        "sent_at": datetime.now(),
    }


# =========================================================
# GET EMAIL LOGS
# =========================================================

def get_email_logs():

    now = datetime.now().isoformat()

    return [
        {
            "id": "email-001",
            "taskName": "Develop User Authentication API",
            "assigneeName": "Ganesh Test",
            "assigneeAvatar": "",
            "emailAddress": "ganesh@gmail.com",
            "assignedBy": "System",
            "subject": "Task Assigned",
            "status": "Delivered",
            "emailType": "Assignment",
            "sentTime": now,
            "deliveryTime": "1.2 sec",
            "content": (
                "You have been assigned the task "
                "'Develop User Authentication API'."
            ),
        },
        {
            "id": "email-002",
            "taskName": "Complete Dashboard UI",
            "assigneeName": "Mahathi",
            "assigneeAvatar": "",
            "emailAddress": "mahathi@gmail.com",
            "assignedBy": "System",
            "subject": "Task Reminder",
            "status": "Delivered",
            "emailType": "Reminder",
            "sentTime": now,
            "deliveryTime": "1.5 sec",
            "content": (
                "This is a reminder regarding your assigned task."
            ),
        },
    ]