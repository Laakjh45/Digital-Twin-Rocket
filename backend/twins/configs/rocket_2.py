ROCKET_2_CONFIG = {
    # Identity
    "id": "rocket_2",
    "name": "PSLV Twin",
    "type": "launch_vehicle",
    # Database
    "measurement": "rocket_sensors",
    # Runtime
    "enabled": True,
    # Sensor Metrics
    "metrics": {

        # ---------------- TEMPERATURE ----------------
        "temperature": {
            "offline": {
                "greater_than": 1000
            },
            "bands": [
                {"label": "optimal",  "min": 0,  "max": 40,   "severity": 0, "color": "#22c55e"},
                {"label": "healthy",  "min": 40, "max": 65,   "severity": 1, "color": "#84cc16"},
                {"label": "moderate", "min": 65, "max": 80,   "severity": 2, "color": "#eab308"},
                {"label": "warning",  "min": 80, "max": 90,   "severity": 3, "color": "#f97316"},
                {"label": "critical", "min": 90, "max": 150,  "severity": 4, "color": "#ef4444"}
            ]
        },

        # ---------------- PRESSURE ----------------
        "pressure": {
            "offline": {
                "greater_than": 1000
            },
            "bands": [
                {"label": "critical", "min": 0,  "max": 5,    "severity": 4, "color": "#ef4444"},
                {"label": "warning",  "min": 5,  "max": 10,   "severity": 3, "color": "#f97316"},
                {"label": "moderate", "min": 10, "max": 20,   "severity": 2, "color": "#eab308"},
                {"label": "healthy",  "min": 20, "max": 40,   "severity": 1, "color": "#84cc16"},
                {"label": "optimal",  "min": 40, "max": 150,  "severity": 0, "color": "#22c55e"}
            ]
        },

        # ---------------- VIBRATION ----------------
        "vibration": {
            "offline": {
                "greater_than": 1000
            },
            "bands": [
                {"label": "optimal",  "min": 0, "max": 2,    "severity": 0, "color": "#22c55e"},
                {"label": "healthy",  "min": 2, "max": 4,    "severity": 1, "color": "#84cc16"},
                {"label": "moderate", "min": 4, "max": 6,    "severity": 2, "color": "#eab308"},
                {"label": "warning",  "min": 6, "max": 8,    "severity": 3, "color": "#f97316"},
                {"label": "critical", "min": 8, "max": 150,  "severity": 4, "color": "#ef4444"}
            ]
        },

        # ---------------- ACCELERATION ----------------
        "acceleration": {
            "offline": {
                "greater_than": 1000
            },
            "bands": [
                {"label": "optimal",  "min": 0,  "max": 10,   "severity": 0, "color": "#22c55e"},
                {"label": "healthy",  "min": 10, "max": 20,   "severity": 1, "color": "#84cc16"},
                {"label": "moderate", "min": 20, "max": 30,   "severity": 2, "color": "#eab308"},
                {"label": "warning",  "min": 30, "max": 40,   "severity": 3, "color": "#f97316"},
                {"label": "critical", "min": 40, "max": 150,  "severity": 4, "color": "#ef4444"}
            ]
        },

        # ---------------- FUEL LEVEL ----------------
        "fuel_level": {
            "offline": {
                "greater_than": 1000
            },
            "bands": [
                {"label": "critical", "min": 0,  "max": 10,  "severity": 4, "color": "#ef4444"},
                {"label": "warning",  "min": 10, "max": 25,  "severity": 3, "color": "#f97316"},
                {"label": "moderate", "min": 25, "max": 50,  "severity": 2, "color": "#eab308"},
                {"label": "healthy",  "min": 50, "max": 75,  "severity": 1, "color": "#84cc16"},
                {"label": "optimal",  "min": 75, "max": 100, "severity": 0, "color": "#22c55e"}
            ]
        },

        # ---------------- VOLTAGE ----------------
        "voltage": {
            "offline": {
                "greater_than": 1000
            },
            "bands": [
                {"label": "critical", "min": 0,  "max": 20,   "severity": 4, "color": "#ef4444"},
                {"label": "warning",  "min": 20, "max": 22,   "severity": 3, "color": "#f97316"},
                {"label": "moderate", "min": 22, "max": 24,   "severity": 2, "color": "#eab308"},
                {"label": "healthy",  "min": 24, "max": 28,   "severity": 1, "color": "#84cc16"},
                {"label": "optimal",  "min": 28, "max": 150,  "severity": 0, "color": "#22c55e"}
            ]
        },

        # ---------------- CURRENT ----------------
        "current": {
            "offline": {
                "greater_than": 1000
            },
            "bands": [
                {"label": "optimal",  "min": 0, "max": 3,    "severity": 0, "color": "#22c55e"},
                {"label": "healthy",  "min": 3, "max": 5,    "severity": 1, "color": "#84cc16"},
                {"label": "moderate", "min": 5, "max": 7,    "severity": 2, "color": "#eab308"},
                {"label": "warning",  "min": 7, "max": 9,    "severity": 3, "color": "#f97316"},
                {"label": "critical", "min": 9, "max": 150,  "severity": 4, "color": "#ef4444"}
            ]
        },

        # ---------------- SYSTEM HEALTH ----------------
        "health": {
            "offline": {
                "greater_than": 1000
            },
            "bands": [
                {"label": "critical", "min": 0,  "max": 20,  "severity": 4, "color": "#ef4444"},
                {"label": "warning",  "min": 20, "max": 40,  "severity": 3, "color": "#f97316"},
                {"label": "moderate", "min": 40, "max": 60,  "severity": 2, "color": "#eab308"},
                {"label": "healthy",  "min": 60, "max": 80,  "severity": 1, "color": "#84cc16"},
                {"label": "optimal",  "min": 80, "max": 100, "severity": 0, "color": "#22c55e"}
            ]
        },

        # ---------------- STRAIN ----------------
        "strain": {
            "offline": {
                "greater_than": 1000
            },
            "bands": [
                {"label": "optimal",  "min": 0, "max": 1,    "severity": 0, "color": "#22c55e"},
                {"label": "healthy",  "min": 1, "max": 2,    "severity": 1, "color": "#84cc16"},
                {"label": "moderate", "min": 2, "max": 3,    "severity": 2, "color": "#eab308"},
                {"label": "warning",  "min": 3, "max": 4,    "severity": 3, "color": "#f97316"},
                {"label": "critical", "min": 4, "max": 150,  "severity": 4, "color": "#ef4444"}
            ]
        },

        # ---------------- IGNITION STATUS ----------------
        "ignition": {
            "offline": {
                "greater_than": 1000
            },
            "bands": [
                {"label": "inactive", "min": 0,   "max": 0.5, "severity": 2, "color": "#eab308"},
                {"label": "active",   "min": 0.5, "max": 1,   "severity": 0, "color": "#22c55e"}
            ]
        }
    }
}