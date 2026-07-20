import json

from app.websocket.connection_manager import manager


class NotificationService:

    async def task_created(self, task):

        await manager.broadcast(
            json.dumps({
                "event": "task_created",
                "task_id": str(task.id),
                "title": task.title
            })
        )

    async def task_updated(self, task):

        await manager.broadcast(
            json.dumps({
                "event": "task_updated",
                "task_id": str(task.id),
                "title": task.title
            })
        )

    async def task_deleted(self, task_id):

        await manager.broadcast(
            json.dumps({
                "event": "task_deleted",
                "task_id": str(task_id)
            })
        )

    async def task_assigned(self, task):

        await manager.broadcast(
            json.dumps({
                "event": "task_assigned",
                "task_id": str(task.id),
                "assigned_to": str(task.assigned_to)
            })
        )

    async def task_status_changed(self, task):

        await manager.broadcast(
            json.dumps({
                "event": "status_changed",
                "task_id": str(task.id),
                "status": task.status
            })
        )


notification_service = NotificationService()