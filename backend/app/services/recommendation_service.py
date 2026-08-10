def save_recommendation(data):

    return {
        "message": "Recommendation saved successfully",
        "data": data
    }

def get_today_recommendations():

    return [
        {
            "user": "Ganesh",
            "recommendation": "Complete Task API integration."
        },
        {
            "user": "Mahathi",
            "recommendation": "Review Celery jobs."
        }
    ]