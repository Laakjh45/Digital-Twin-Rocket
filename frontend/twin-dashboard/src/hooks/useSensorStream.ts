import { useEffect, useState } from "react";

export default function useSensorStream(
  selectedSensor: string,
  sensorData: any,
  alerts: any[]
) {
  const [latestData, setLatestData] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [localAlerts, setLocalAlerts] = useState<any[]>([]);

  // Sync alerts from App
  useEffect(() => {
    setLocalAlerts(alerts);
  }, [alerts]);

  // Process sensor data
  useEffect(() => {
    if (!selectedSensor || !sensorData[selectedSensor]) return;

    const sensor = sensorData[selectedSensor];

    // Latest values
    const latest = Object.keys(sensor).map((field) => ({
      field,
      value: sensor[field].value,
    }));

    setLatestData(latest);

    // History (time series)
    setHistoryData((prev: any[]) => {
      const updated = [...prev];

      Object.keys(sensor).forEach((field) => {
        let trace = updated.find((t: any) => t.name === field);

        if (!trace) {
          trace = {
            x: [],
            y: [],
            type: "scatter",
            mode: "lines",
            name: field,
          };
          updated.push(trace);
        }

        trace.x.push(new Date(sensor[field].time));
        trace.y.push(sensor[field].value);

        // limit buffer
        if (trace.x.length > 60) {
          trace.x.shift();
          trace.y.shift();
        }
      });

      return [...updated];
    });
  }, [sensorData, selectedSensor]);

  return { latestData, historyData, alerts: localAlerts };
}