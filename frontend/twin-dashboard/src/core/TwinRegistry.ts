import RocketPreview from "../components/preview/RocketPreview";

//UNIVERSAL TWIN DEFINITION
export type TwinDefinition = {
  id: string;
  name: string;
  description: string;
  measurement: string;
  modelPath: string;
  camera?: {
    position?: [number, number, number];
    offset?: [number, number, number];
    fov?: number;
  };
  previewComponent: any;
  sensorConfig?: string;
  theme: {
    primary: string;
    secondary: string;
  };
  enabled: boolean;
};

//ALL DIGITAL TWINS REGISTER HERE
export const twins: TwinDefinition[] = [
  {
    id: "pslv_1",
    name: "PSLV Twin",
    description: "Propulsion • Thermal • Structural telemetry",
    measurement: "rocket_sensors",
    modelPath: "/models/PSLV_DigitalTwin_v2.glb",
    camera: {
      position: [5, 5, 10],
      offset: [5, 3, 20],
      fov: 50,
    },
    previewComponent: RocketPreview,
    sensorConfig: "/configs/pslvSensors.ts",
    theme: {
      primary: "#38bdf8",
      secondary: "#6366f1",
    },
    enabled: true,
  },

  // FUTURE MODELS

  {
    id: "gslv_1",
    name: "GSLV Twin",
    description: "Cryogenic propulsion monitoring",
    measurement: "gslv_sensors",
    modelPath: "/models/PSLV_DigitalTwin_v2.glb",
    camera: {
      position: [5, 5, 10],
      offset: [5, 3, 20],
      fov: 50,
    },
    previewComponent: RocketPreview,
    theme: {
      primary: "#8b5cf6",
      secondary: "#06b6d4",
    },
    enabled: false,
  },

  {
    id: "rlv_1",
    name: "RLV Twin",
    description: "Reusable launch vehicle telemetry",
    measurement: "rlv_sensors",
    modelPath: "/models/PSLV_DigitalTwin_v2.glb",
    camera: {
      position: [5, 5, 10],
      offset: [5, 3, 20],
      fov: 50,
    },
    previewComponent: RocketPreview,
    theme: {
      primary: "#0ea5e9",
      secondary: "#14b8a6",
    },
    enabled: false,
  },

//   {
//     id: "satellite_1",
//     name: "Satellite Twin",
//     description: "Orbital systems & thermal analytics",
//     measurement: "satellite_sensors",
//     modelPath: "/models/satellite.glb",
//     previewComponent: RocketPreview,
//     theme: {
//       primary: "#6366f1",
//       secondary: "#ec4899",
//     },
//     enabled: false,
//   },

//   {
//     id: "aircraft_1",
//     name: "Aircraft Twin",
//     description: "Flight systems & structural health",
//     measurement: "aircraft_sensors",
//     modelPath: "/models/aircraft.glb",
//     previewComponent: RocketPreview,
//     theme: {
//       primary: "#06b6d4",
//       secondary: "#3b82f6",
//     },
//     enabled: false,
//   },

//   {
//     id: "engine_1",
//     name: "Engine Twin",
//     description: "Combustion & vibration analysis",
//     measurement: "engine_sensors",
//     modelPath: "/models/engine.glb",
//     previewComponent: RocketPreview,
//     theme: {
//       primary: "#f59e0b",
//       secondary: "#ef4444",
//     },
//     enabled: false,
//   },

//   {
//     id: "factory_1",
//     name: "Factory Twin",
//     description: "Industrial process monitoring",
//     measurement: "factory_sensors",
//     modelPath: "/models/factory.glb",
//     previewComponent: RocketPreview,
//     theme: {
//       primary: "#22c55e",
//       secondary: "#06b6d4",
//     },
//     enabled: false,
//   },
];