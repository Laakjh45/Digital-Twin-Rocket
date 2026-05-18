from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime, UTC
import random
import time
from config import (INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, INFLUXDB_BUCKET)

TWIN_ID = "rocket_3"

client = InfluxDBClient(
    url=INFLUXDB_URL,
    token=INFLUXDB_TOKEN,
    org=INFLUXDB_ORG
)

bucket = INFLUXDB_BUCKET

# ===== CONNECT =====
client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG)
write_api = client.write_api(write_options=SYNCHRONOUS)

# ===== SENSOR DEFINITIONS =====
SENSORS = {
    "SENSOR_FAIRING_TEMP": ["temperature"],
    "SENSOR_FAIRING_VIBRATION": ["vibration"],
    "SENSOR_PS1_AFT_VIBRATION": ["vibration", "acceleration"],
    "SENSOR_PS1_CHAMBER_PRESS": ["chamber_pressure"],
    "SENSOR_PS1_IGNITION_CONFIRM": ["ignition_status"],
    "SENSOR_PS1_NOZZLE_STRUCT": ["nozzle_health", "temperature"],
    "SENSOR_PS1_STRAIN_A": ["strain"],
    "SENSOR_PS1_STRAIN_B": ["strain"],
    "SENSOR_PS1_TEMP_BOTTOM": ["temperature"],
    "SENSOR_PS1_TEMP_MID": ["temperature"],
    "SENSOR_PS1_TEMP_TOP": ["temperature"],
    "SENSOR_PS1_TVC_FEEDBACK": ["tvc_angle", "tvc_status"],
    "SENSOR_PS1_VIBRATION": ["vibration", "acceleration"],
    "SENSOR_PS2_ENGINE_CHAMBER": ["chamber_pressure", "temperature"],
    "SENSOR_PS2_FEED_TEMP": ["temperature"],
    "SENSOR_PS2_FUEL_PRESS": ["fuel_pressure"],
    "SENSOR_PS2_OX_PRESS": ["oxidizer_pressure"],
    "SENSOR_PS2_STRUCT_TEMP": ["temperature"],
    "SENSOR_PS3_STRAIN": ["strain"],
    "SENSOR_PS3_TEMP": ["temperature"],
    "SENSOR_PS4_ELECTRICAL": ["voltage", "current"],
    "SENSOR_PS4_ENGINE_HEALTH": ["engine_health", "temperature"],
    "SENSOR_PS4_FUEL_PRESS": ["fuel_pressure"],
    "SENSOR_STRAP_A_CHAMBER": ["chamber_pressure"],
    "SENSOR_STRAP_A_IGNITION": ["ignition_status"],
    "SENSOR_STRAP_A_NOZZLE": ["nozzle_health", "temperature"],
    "SENSOR_STRAP_A_STRAIN": ["strain"],
    "SENSOR_STRAP_A_TEMP": ["temperature"],
    "SENSOR_STRAP_A_VIBRATION": ["vibration", "acceleration"],
    "SENSOR_STRAP_B_CHAMBER": ["chamber_pressure"],
    "SENSOR_STRAP_B_IGNITION": ["ignition_status"],
    "SENSOR_STRAP_B_NOZZLE": ["nozzle_health", "temperature"],
    "SENSOR_STRAP_B_STRAIN": ["strain"],
    "SENSOR_STRAP_B_TEMP": ["temperature"],
    "SENSOR_STRAP_B_VIBRATION": ["vibration", "acceleration"],
    "SENSOR_STRAP_C_CHAMBER": ["chamber_pressure"],
    "SENSOR_STRAP_C_IGNITION": ["ignition_status"],
    "SENSOR_STRAP_C_NOZZLE": ["nozzle_health", "temperature"],
    "SENSOR_STRAP_C_STRAIN": ["strain"],
    "SENSOR_STRAP_C_TEMP": ["temperature"],
    "SENSOR_STRAP_C_VIBRATION": ["vibration", "acceleration"],
    "SENSOR_STRAP_D_CHAMBER": ["chamber_pressure"],
    "SENSOR_STRAP_D_IGNITION": ["ignition_status"],
    "SENSOR_STRAP_D_NOZZLE": ["nozzle_health", "temperature"],
    "SENSOR_STRAP_D_STRAIN": ["strain"],
    "SENSOR_STRAP_D_TEMP": ["temperature"],
    "SENSOR_STRAP_D_VIBRATION": ["vibration", "acceleration"],
    "SENSOR_STRAP_E_CHAMBER": ["chamber_pressure"],
    "SENSOR_STRAP_E_IGNITION": ["ignition_status"],
    "SENSOR_STRAP_E_NOZZLE": ["nozzle_health", "temperature"],
    "SENSOR_STRAP_E_STRAIN": ["strain"],
    "SENSOR_STRAP_E_TEMP": ["temperature"],
    "SENSOR_STRAP_E_VIBRATION": ["vibration", "acceleration"],
    "SENSOR_STRAP_F_CHAMBER": ["chamber_pressure"],
    "SENSOR_STRAP_F_IGNITION": ["ignition_status"],
    "SENSOR_STRAP_F_NOZZLE": ["nozzle_health", "temperature"],
    "SENSOR_STRAP_F_STRAIN": ["strain"],
    "SENSOR_STRAP_F_TEMP": ["temperature"],
    "SENSOR_STRAP_F_VIBRATION": ["vibration", "acceleration"],
}

def generate_value(metric):
    if "temperature" in metric:
        return random.uniform(20, 120)
    elif "pressure" in metric:
        return random.uniform(1, 10)
    elif "vibration" in metric:
        return random.uniform(0, 10)
    elif "acceleration" in metric:
        return random.uniform(0, 50)
    elif "fuel" in metric:
        return random.uniform(0, 100)
    elif "voltage" in metric:
        return random.uniform(20, 30)
    elif "current" in metric:
        return random.uniform(1, 10)
    elif "health" in metric:
        return random.uniform(0, 100)
    elif "strain" in metric:
        return random.uniform(0, 5)
    elif "ignition" in metric:
        return random.choice([0, 1])
    else:
        return random.random()

print("🚀 Rocket Simulator Started...\n")

while True:
    for sensor_id, metrics in SENSORS.items():
        point = (
            Point("rocket_sensors")
            .tag("twin_id", TWIN_ID)
            .tag("sensor_id", sensor_id)
        )

        for metric in metrics:
            value = generate_value(metric)
            point = point.field(metric, value)

        point = point.time(datetime.now(UTC), WritePrecision.NS)

        write_api.write(bucket=bucket, org=INFLUXDB_ORG, record=point)

    print("Batch written at", datetime.now())
    time.sleep(2)