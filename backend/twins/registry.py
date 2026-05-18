from twins.configs.rocket_1 import ROCKET_1_CONFIG
from twins.configs.rocket_2 import ROCKET_2_CONFIG
from twins.configs.rocket_3 import ROCKET_3_CONFIG

# AUTHORITATIVE BACKEND TWIN REGISTRY

TWINS = {
    ROCKET_1_CONFIG["id"]: ROCKET_1_CONFIG,
    ROCKET_2_CONFIG["id"]: ROCKET_2_CONFIG,
    ROCKET_3_CONFIG["id"]: ROCKET_3_CONFIG,
}

# HELPERS

def get_twin_config(twin_id: str):
    config = TWINS.get(twin_id)
    if not config:
        raise ValueError(f"Unknown twin_id: {twin_id}")
    if not config.get("enabled", False):
        raise ValueError(f"Twin disabled: {twin_id}")
    return config

def twin_exists(twin_id: str):
    return twin_id in TWINS

def get_measurement(twin_id: str):
    config = get_twin_config(twin_id)
    return config["measurement"]


def get_metric_config(twin_id: str, metric: str):
    config = get_twin_config(twin_id)
    return config["metrics"].get(metric)