import time
from redis_client import publish_alert, publish_notification
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
from config import (INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, INFLUXDB_BUCKET)

client = InfluxDBClient(
    url=INFLUXDB_URL,
    token=INFLUXDB_TOKEN,
    org=INFLUXDB_ORG,
)

bucket = INFLUXDB_BUCKET
org = INFLUXDB_ORG
write_api = client.write_api(write_options=SYNCHRONOUS)

# STATE (prevents spam alerts)
alert_state = {}
last_seen = {}

# Thresholds (we will later move to config)
TEMP_THRESHOLD = 85
STALE_TIMEOUT = 5  # seconds

def store_event(twin_id, event):
    point = (
        Point("events")
        .tag("twin_id", twin_id)
        .tag("type", event["type"])
        .tag("severity", event.get("severity", "info"))
        .tag("sensor", event.get("sensor", "system"))
        .field("message", event["message"])
        .field("status", event.get("status", "active"))
        .time(int(event["time"] * 1e9), WritePrecision.NS)
    )

    write_api.write(bucket=bucket, org=org, record=point)


def process_data(twin_id: str, result: dict):
    alerts = []
    notifications = []

    now = time.time()

    # PROCESS SENSOR DATA
    for sensor, fields in result.items():
        if (twin_id, sensor) not in last_seen:
            notif = {
                "type": "notification",
                "sensor": sensor,
                "message": f"{sensor} connected",
                "time": now
            }

            publish_notification(twin_id, notif)
            store_event(twin_id, notif)
            notifications.append(notif)
        last_seen[(twin_id, sensor)] = now

        # Temperature Alert
        if "temperature" in fields:
            temp = fields["temperature"]["value"]
            key = f"{twin_id}_{sensor}_temp"

            if temp > TEMP_THRESHOLD:
                if alert_state.get(key) != "active":
                    alert_state[key] = "active"

                    alert = {
                        "type": "alert",
                        "severity": "critical",
                        "sensor": sensor,
                        "message": f"{sensor} high temperature: {temp:.2f}°C",
                        "status": "active",
                        "time": now
                    }

                    publish_alert(twin_id, alert)
                    store_event(twin_id, alert)
                    alerts.append(alert)

            else:
                if alert_state.get(key) == "active":
                    alert_state[key] = "resolved"

                    notif = {
                        "type": "notification",
                        "sensor": sensor,
                        "message": f"{sensor} temperature back to normal",
                        "status": "resolved",
                        "time": now
                    }

                    publish_notification(twin_id, notif)
                    store_event(twin_id, notif)
                    notifications.append(notif)

        # Pressure Alert
        if "pressure" in fields:
            p = fields["pressure"]["value"]
            key = f"{twin_id}_{sensor}_pressure"

            if p < 10:
                if alert_state.get(key) != "active":
                    alert_state[key] = "active"

                    alert = {
                        "type": "alert",
                        "severity": "warning",
                        "sensor": sensor,
                        "message": f"{sensor} low pressure: {p:.2f}",
                        "status": "active",
                        "time": now
                    }

                    publish_alert(twin_id, alert)
                    store_event(twin_id, alert)
                    alerts.append(alert)

            else:
                if alert_state.get(key) == "active":
                    alert_state[key] = "resolved"

                    notif = {
                        "type": "notification",
                        "sensor": sensor,
                        "message": f"{sensor} pressure normalized",
                        "status": "resolved",
                        "time": now
                    }

                    publish_notification(twin_id, notif)
                    store_event(twin_id, notif)
                    notifications.append(notif)
        
        if "vibration" in fields:
            v = fields["vibration"]["value"]
            key = f"{twin_id}_{sensor}_vibration"

            if v > 8:
                if alert_state.get(key) != "active":
                    alert_state[key] = "active"

                    alert = {
                        "type": "alert",
                        "severity": "warning",
                        "sensor": sensor,
                        "message": f"{sensor} high vibration: {v:.2f}",
                        "status": "active",
                        "time": now
                    }

                    publish_alert(twin_id, alert)
                    store_event(twin_id, alert)
                    alerts.append(alert)

            else:
                if alert_state.get(key) == "active":
                    alert_state[key] = "resolved"

                    notif = {
                        "type": "notification",
                        "sensor": sensor,
                        "message": f"{sensor} vibration normalized",
                        "status": "resolved",
                        "time": now
                    }

                    publish_notification(twin_id, notif)
                    store_event(twin_id, notif) 
                    notifications.append(notif) 
        
        if "voltage" in fields:
            v = fields["voltage"]["value"]
            key = f"{twin_id}_{sensor}_voltage"

            if v < 20 or v > 30:
                if alert_state.get(key) != "active":
                    alert_state[key] = "active"

                    alert = {
                        "type": "alert",
                        "severity": "warning",
                        "sensor": sensor,
                        "message": f"{sensor} voltage out of range: {v:.2f}",
                        "status": "active",
                        "time": now
                    }

                    publish_alert(twin_id, alert)
                    store_event(twin_id, alert)
                    alerts.append(alert)

            else:
                if alert_state.get(key) == "active":
                    alert_state[key] = "resolved"

                    notif = {
                        "type": "notification",
                        "sensor": sensor,
                        "message": f"{sensor} voltage normalized",
                        "status": "resolved",
                        "time": now
                    }

                    publish_notification(twin_id, notif)
                    store_event(twin_id, notif)
                    notifications.append(notif)
                    
        if "acceleration" in fields:
            a = fields["acceleration"]["value"]
            key = f"{twin_id}_{sensor}_acceleration"

            if a > 40:
                if alert_state.get(key) != "active":
                    alert_state[key] = "active"

                    alert = {
                        "type": "alert",
                        "severity": "warning",
                        "sensor": sensor,
                        "message": f"{sensor} high acceleration: {a:.2f}",
                        "status": "active",
                        "time": now
                    }

                    publish_alert(twin_id, alert)
                    store_event(twin_id, alert)
                    alerts.append(alert)

            else:
                if alert_state.get(key) == "active":
                    alert_state[key] = "resolved"

                    notif = {
                        "type": "notification",
                        "sensor": sensor,
                        "message": f"{sensor} acceleration normalized",
                        "status": "resolved",
                        "time": now
                    }

                    publish_notification(twin_id, notif)
                    store_event(twin_id, notif)
                    notifications.append(notif)

        if "fuel_pressure" in fields:
            f = fields["fuel_pressure"]["value"]
            key = f"{twin_id}_{sensor}_fuel"

            if f < 20:
                if alert_state.get(key) != "active":
                    alert_state[key] = "active"

                    alert = {
                        "type": "alert",
                        "severity": "critical",
                        "sensor": sensor,
                        "message": f"{sensor} low fuel pressure: {f:.2f}",
                        "status": "active",
                        "time": now
                    }

                    publish_alert(twin_id, alert)
                    store_event(twin_id, alert)
                    alerts.append(alert)

            else:
                if alert_state.get(key) == "active":
                    alert_state[key] = "resolved"

                    notif = {
                        "type": "notification",
                        "sensor": sensor,
                        "message": f"{sensor} fuel pressure normalized",
                        "status": "resolved",
                        "time": now
                    }

                    publish_notification(twin_id, notif)
                    store_event(twin_id, notif)
                    notifications.append(notif)
        
        if "current" in fields:
            c = fields["current"]["value"]
            key = f"{twin_id}_{sensor}_current"

            if c < 1 or c > 10:
                if alert_state.get(key) != "active":
                    alert_state[key] = "active"

                    alert = {
                        "type": "alert",
                        "severity": "warning",
                        "sensor": sensor,
                        "message": f"{sensor} current out of range: {c:.2f}",
                        "status": "active",
                        "time": now
                    }

                    publish_alert(twin_id, alert)
                    store_event(twin_id, alert)
                    alerts.append(alert)

            else:
                if alert_state.get(key) == "active":
                    alert_state[key] = "resolved"

                    notif = {
                        "type": "notification",
                        "sensor": sensor,
                        "message": f"{sensor} current normalized",
                        "status": "resolved",
                        "time": now
                    }

                    publish_notification(twin_id, notif)
                    store_event(twin_id, notif)
                    notifications.append(notif)
        
        if "engine_health" in fields:
            h = fields["engine_health"]["value"]
            key = f"{twin_id}_{sensor}_health"

            if h < 50:
                if alert_state.get(key) != "active":
                    alert_state[key] = "active"

                    alert = {
                        "type": "alert",
                        "severity": "critical",
                        "sensor": sensor,
                        "message": f"{sensor} low health: {h:.2f}%",
                        "status": "active",
                        "time": now
                    }

                    publish_alert(twin_id, alert)
                    store_event(twin_id, alert)
                    alerts.append(alert)

            else:
                if alert_state.get(key) == "active":
                    alert_state[key] = "resolved"

                    notif = {
                        "type": "notification",
                        "sensor": sensor,
                        "message": f"{sensor} health restored",
                        "status": "resolved",
                        "time": now
                    }

                    publish_notification(twin_id, notif)
                    store_event(twin_id, notif)
                    notifications.append(notif)
        
        if "strain" in fields:
            s = fields["strain"]["value"]
            key = f"{twin_id}_{sensor}_strain"

            if s > 4:
                if alert_state.get(key) != "active":
                    alert_state[key] = "active"

                    alert = {
                        "type": "alert",
                        "severity": "warning",
                        "sensor": sensor,
                        "message": f"{sensor} high strain: {s:.2f}",
                        "status": "active",
                        "time": now
                    }

                    publish_alert(twin_id, alert)
                    store_event(twin_id, alert)
                    alerts.append(alert)

            else:
                if alert_state.get(key) == "active":
                    alert_state[key] = "resolved"

                    notif = {
                        "type": "notification",
                        "sensor": sensor,
                        "message": f"{sensor} strain normalized",
                        "status": "resolved",
                        "time": now
                    }

                    publish_notification(twin_id, notif)
                    store_event(twin_id, notif)
                    notifications.append(notif)

        if "ignition_status" in fields:
            ign = fields["ignition_status"]["value"]
            key = f"{twin_id}_{sensor}_ignition"

            if ign == 0:
                if alert_state.get(key) != "active":
                    alert_state[key] = "active"

                    alert = {
                        "type": "alert",
                        "severity": "critical",
                        "sensor": sensor,
                        "message": f"{sensor} ignition OFF",
                        "status": "active",
                        "time": now
                    }

                    publish_alert(twin_id, alert)
                    store_event(twin_id, alert)
                    alerts.append(alert)

            else:
                if alert_state.get(key) == "active":
                    alert_state[key] = "resolved"

                    notif = {
                        "type": "notification",
                        "sensor": sensor,
                        "message": f"{sensor} ignition restored",
                        "status": "resolved",
                        "time": now
                    }

                    publish_notification(twin_id, notif)
                    store_event(twin_id, notif)
                    notifications.append(notif)

    # 🔌 Sensor Disconnect Detection
    for (t_id, sensor), last in list(last_seen.items()):
        if t_id != twin_id:
            continue

        if now - last > STALE_TIMEOUT:
            notif = {
                "type": "notification",
                "sensor": sensor,
                "message": f"{sensor} disconnected",
                "status": "inactive",
                "time": now
            }

            publish_notification(twin_id, notif)
            store_event(twin_id, notif)
            notifications.append(notif)

            del last_seen[(t_id, sensor)]

    return alerts, notifications