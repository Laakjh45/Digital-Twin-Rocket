from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Read variables
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")

# print("CONFIG DEBUG:")
# print("URL:", INFLUXDB_URL)
# print("TOKEN:", INFLUXDB_TOKEN)
# print("ORG:", INFLUXDB_ORG)
# print("BUCKET:", INFLUXDB_BUCKET)

# Fail fast if missing
if not INFLUXDB_URL:
    raise ValueError("INFLUXDB_URL missing in .env")