from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime, UTC
import random
from config import (INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, INFLUXDB_BUCKET)

client = InfluxDBClient(
    url=INFLUXDB_URL,
    token=INFLUXDB_TOKEN,
    org=INFLUXDB_ORG
)

bucket = INFLUXDB_BUCKET

# ===== CONNECT =====
client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG)
write_api = client.write_api(write_options=SYNCHRONOUS)

# ===== GENERATE RANDOM DATA =====
temperature = random.uniform(20, 35)
pressure = random.uniform(1, 2)

point = (
    Point("rocket_sensors")
    .tag("sensor_id", "sensor_1")
    .field("temperature", temperature)
    .field("pressure", pressure)
    .time(datetime.now(UTC), WritePrecision.NS)
)

write_api.write(bucket=bucket, org=INFLUXDB_ORG, record=point)

print("Data written successfully!")