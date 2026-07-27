from datetime import datetime


def generate_task_update(task_id):

    update = {
        "task_id": str(task_id),
        "update": "AI generated progress update: Task is progressing as expected.",
        "generated_at": datetime.now()
    }

    return update

from datetime import datetime


def get_task_updates(task_id):

    return [
        {
            "task_id": str(task_id),
            "update": "Task has been assigned to the developer.",
            "generated_at": datetime.now()
        },
        {
            "task_id": str(task_id),
            "update": "Backend API implementation is 60% complete.",
            "generated_at": datetime.now()
        }
    ]


def get_full_timeline(task_id):

    return {
        "task_id": str(task_id),

        "status_history": [
            {
                "status": "To Do"
            },
            {
                "status": "In Progress"
            }
        ],

        "updates": [
            {
                "message": "AI generated progress update."
            }
        ],

        "remarks": [
            {
                "remark": "Developer has started implementation."
            }
        ],

        "blockers": [
            {
                "blocker": "Waiting for frontend integration."
            }
        ]
    }