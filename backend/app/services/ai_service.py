import requests


AI_SERVICE_URL = "http://localhost:8001/extract"


def extract_tasks_from_text(text: str):

    """
    Calls Deekshitha's AI Extraction API.
    """

    response = requests.post(
        AI_SERVICE_URL,
        json={
            "text": text
        },
        timeout=30
    )

    response.raise_for_status()

    return response.json()