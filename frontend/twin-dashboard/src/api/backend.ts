import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export const getSensors = async () => {
  const response = await API.get("/sensors");
  return response.data.sensors;
};

export const getLatest = async (sensorId: string) => {
  const response = await API.get(`/sensor/${sensorId}/latest`);
  return response.data;
};

export const getHistory = async (sensorId: string, minutes = 5) => {
  const response = await API.get(
    `/sensor/${sensorId}/history?minutes=${minutes}`
  );
  return response.data;
};

export const getAllLatest = async () => {
  const response = await API.get("/sensors/latest-all");
  return response.data;
};