from app.utils.redis_client import redis_client

try:
    redis_client.set("test", "Redis Working")
    value = redis_client.get("test")

    print("Redis Connected Successfully!")
    print(value)

except Exception as e:
    print(e)