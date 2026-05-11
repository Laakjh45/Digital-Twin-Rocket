import redis
import json

# Connect to Redis
r = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True
)

#  Dynamic channels (multi-twin support)
def get_alert_channel(twin_id: str):
    return f"alerts:{twin_id}"

def get_notification_channel(twin_id: str):
    return f"notifications:{twin_id}"

#  Publish alert
def publish_alert(twin_id: str, alert: dict):
    r.publish(get_alert_channel(twin_id), json.dumps(alert))

#  Publish notification
def publish_notification(twin_id: str, notification: dict):
    r.publish(get_notification_channel(twin_id), json.dumps(notification))