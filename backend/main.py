from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from influxdb_client import InfluxDBClient
from influxdb_client.client.query_api import QueryApi
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import time
from alert_engine import process_data
import json
import threading
from redis_client import r, get_alert_channel, get_notification_channel
from config import (INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, INFLUXDB_BUCKET)

client = InfluxDBClient(
    url=INFLUXDB_URL,
    token=INFLUXDB_TOKEN,
    org=INFLUXDB_ORG
)

bucket = INFLUXDB_BUCKET
MEASUREMENT = "rocket_sensors"

# ===== APP INIT =====
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

query_api: QueryApi = client.query_api()

# ===== ROUTES =====

@app.get("/")
def root():
    return {"message": "Digital Twin Backend Running"}

@app.get("/twins/{twin_id}/sensors")
def get_sensors(twin_id: str):
    query = f'''
    from(bucket: "{bucket}")
        |> range(start: -30d)
        |> filter(fn: (r) => r._measurement == "{MEASUREMENT}")
        |> filter(fn: (r) => r.twin_id == "{twin_id}")
        |> keep(columns: ["sensor_id"])
        |> distinct(column: "sensor_id")
    '''
    tables = query_api.query(query)
    sensors = []
    for table in tables:
        for record in table.records:
            sensors.append(record["sensor_id"])
    return {"sensors": sensors}

@app.get("/twins/{twin_id}/sensor/{sensor_id}/history")
def get_history(twin_id: str, sensor_id: str, minutes: int = 10):
    query = f'''
    from(bucket: "{bucket}")
        |> range(start: -{minutes}m)
        |> filter(fn: (r) => r._measurement == "{MEASUREMENT}")
        |> filter(fn: (r) => r.twin_id == "{twin_id}")
        |> filter(fn: (r) => r.sensor_id == "{sensor_id}")
        |> sort(columns: ["_time"])
    '''

    tables = query_api.query(query)
    results = []

    for table in tables:
        for record in table.records:
            results.append({
                "field": record.get_field(),
                "value": record.get_value(),
                "time": record.get_time()
            })

    return {"sensor_id": sensor_id, "data": results}

@app.get("/twins/{twin_id}/sensor/{sensor_id}/latest")
def get_latest(twin_id: str, sensor_id: str):
    query = f'''
    from(bucket: "{bucket}")
        |> range(start: -5m)
        |> filter(fn: (r) => r._measurement == "{MEASUREMENT}")
        |> filter(fn: (r) => r.twin_id == "{twin_id}")
        |> filter(fn: (r) => r.sensor_id == "{sensor_id}")
        |> last()
    '''
    tables = query_api.query(query)
    results = []

    for table in tables:
        for record in table.records:
            results.append({
                "field": record.get_field(),
                "value": record.get_value(),
                "time": record.get_time()
            })

    return {"sensor_id": sensor_id, "data": results}

@app.get("/twins/{twin_id}/sensors/latest-all")
def get_all_latest(twin_id: str):
    query = f'''
    from(bucket: "{bucket}")
        |> range(start: -1m)
        |> filter(fn: (r) => r._measurement == "{MEASUREMENT}")
        |> filter(fn: (r) => r.twin_id == "{twin_id}")
        |> group(columns: ["sensor_id", "_field"])
        |> last()
    '''

    tables = query_api.query(query)

    result = {}

    for table in tables:
        for record in table.records:
            sensor = record["sensor_id"]
            field = record.get_field()
            value = record.get_value()

            if sensor not in result:
                result[sensor] = {}

            timestamp = record.get_time()
            result[sensor][field] = {
                "value": value,
                "time": timestamp.timestamp()
            }

    return result

def redis_listener(ws, twin_id, loop):
    pubsub = r.pubsub()
    pubsub.subscribe(
        get_alert_channel(twin_id),
        get_notification_channel(twin_id)
    )

    try:
        for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])

                asyncio.run_coroutine_threadsafe(
                    ws.send_json(data),
                    loop
                )
    except Exception as e:
        print ("Redis listener error: ", e)
    finally:
        pubsub.close()


@app.websocket("/ws/{twin_id}")
async def websocket_live(ws: WebSocket, twin_id: str):
    await ws.accept()
    loop = asyncio.get_running_loop()
    threading.Thread(
        target=redis_listener,
        args=(ws, twin_id, loop),
        daemon=True
    ).start()

    await ws.send_json({
        "type": "notification",
        "sensor": "system",
        "message": "WebSocket connected",
        "status": "info",
        "time": time.time()
    })

    try:
        while True:
            try:
                query = f'''
                from(bucket: "{bucket}")
                    |> range(start: -5s)
                    |> filter(fn: (r) => r._measurement == "{MEASUREMENT}")
                    |> filter(fn: (r) => r.twin_id == "{twin_id}")
                    |> group(columns: ["sensor_id", "_field"])
                    |> last()
                '''

                tables = query_api.query(query)

                result = {}

                for table in tables:
                    for record in table.records:
                        sensor = record["sensor_id"]
                        field = record.get_field()
                        value = record.get_value()
                        timestamp = record.get_time()

                        if sensor not in result:
                            result[sensor] = {}

                        result[sensor][field] = {
                            "value": value,
                            "time": timestamp.timestamp()
                        }

                process_data(twin_id, result)

                # Send only if data exists
                if result:
                    await ws.send_json({
                        "type": "data",
                        "payload": result
                    })

            except Exception as e:
                print("WS loop error:", e)
                break

            await asyncio.sleep(1)

    except WebSocketDisconnect:
        print(f"Client disconnected from twin {twin_id}")
        

@app.get("/twins/{twin_id}/events/history")
def get_events(twin_id: str, minutes: int = 60):
    query = f'''
    from(bucket: "{bucket}")
        |> range(start: -{minutes}m)
        |> filter(fn: (r) => r._measurement == "events")
        |> filter(fn: (r) => r.twin_id == "{twin_id}")
        |> sort(columns: ["_time"], desc: true)
    '''

    tables = query_api.query(query)

    events = []

    for table in tables:
        for record in table.records:
            events.append({
                "time": record.get_time(),
                "type": record.values.get("type"),
                "severity": record.values.get("severity"),
                "sensor": record.values.get("sensor"),
                "message": record.values.get("message"),
                "status": record.values.get("status")
            })

    return {"events": events}