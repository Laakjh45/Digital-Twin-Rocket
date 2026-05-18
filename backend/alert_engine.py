import math
import time
from redis_client import publish_alert, publish_notification
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
from config import (INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, INFLUXDB_BUCKET)
from twins.registry import get_twin_config, get_metric_config

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

# METRIC CLASSIFICATION ENGINE

def is_offline(value, offline_rules):
    if value is None:
        return True
    if isinstance(value, (int, float)):
        if math.isnan(value):
            return True
    if "greater_than" in offline_rules:
        if value > offline_rules["greater_than"]:
            return True
    if "equals" in offline_rules:
        if value == offline_rules["equals"]:
            return True
    return False

def classify_metric(twin_id: str, metric: str, value):
    metric_config = get_metric_config(twin_id, metric)
    if not metric_config:
        return None
    offline_rules = metric_config.get("offline", {})

    # OFFLINE
    if is_offline(value, offline_rules):
        return {
            "label": "offline",
            "severity": 5,
            "color": "#6b7280",
            "offline": True
        }

    # RANGE CLASSIFICATION
    bands = metric_config.get("bands", [])
    for band in bands:
        min_v = band["min"]
        max_v = band["max"]
        if value >= min_v and value < max_v:
            return {
                "label": band["label"],
                "severity": band["severity"],
                "color": band["color"],
                "offline": False
            }
    return None

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

        # TEMPERATURE CLASSIFICATION
        if "temperature" in fields:
            temp = fields["temperature"]["value"]
            classification = classify_metric(
                twin_id,
                "temperature",
                temp
            )

            if classification:
                key = f"{twin_id}_{sensor}_temperature"
                severity = classification["severity"]
                label = classification["label"]
                previous = alert_state.get(key)

                # OFFLINE
                if classification["offline"]:
                    if previous != "offline":
                        alert_state[key] = "offline"
                        notif = {
                            "type": "notification",
                            "severity": "offline",
                            "sensor": sensor,
                            "metric": "temperature",
                            "message": f"{sensor} temperature sensor offline",
                            "status": "offline",
                            "state": classification,
                            "time": now
                        }
                        publish_notification(twin_id, notif)
                        store_event(twin_id, notif)
                        notifications.append(notif)

                # WARNING / CRITICAL
                elif severity >= 3:
                    if previous != label:
                        alert_state[key] = label
                        alert = {
                            "type": "alert",
                            "severity": label,
                            "sensor": sensor,
                            "metric": "temperature",
                            "message": f"{sensor} temperature {label}: {temp:.2f}",
                            "status": "active",
                            "state": classification,
                            "value": temp,
                            "time": now
                        }

                        publish_alert(twin_id, alert)
                        store_event(twin_id, alert)
                        alerts.append(alert)

                # NORMALIZED
                else:
                    if previous and previous not in ["healthy", "optimal"]:
                        alert_state[key] = label
                        notif = {
                            "type": "notification",
                            "severity": label,
                            "sensor": sensor,
                            "metric": "temperature",
                            "message": f"{sensor} temperature normalized",
                            "status": "resolved",
                            "state": classification,
                            "value": temp,
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