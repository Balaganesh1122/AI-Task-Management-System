from datetime import datetime


def send_email(email):

    return {
        "message": "Email queued successfully",
        "to": email.to,
        "subject": email.subject,
        "body": email.body,
        "sent_at": datetime.now()
    }

from datetime import datetime


def get_email_logs():

    return [
        {
            "id": 1,
            "to": "ganesh@gmail.com",
            "subject": "Task Assigned",
            "email_type": "Assignment",
            "status": "Sent",
            "sent_at": datetime.now()
        },
        {
            "id": 2,
            "to": "mahathi@gmail.com",
            "subject": "Reminder",
            "email_type": "Reminder",
            "status": "Sent",
            "sent_at": datetime.now()
        }
    ]