import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export const getSensors = async (twinId: string) => {
  const response = await API.get(`/twins/${twinId}/sensors`);
  return response.data.sensors;
};

export const getLatest = async (twinId: string, sensorId: string) => {
  const response = await API.get(`/twins/${twinId}/sensor/${sensorId}/latest`);
  return response.data;
};

export const getHistory = async (twinId: string, sensorId: string, minutes = 5) => {
  const response = await API.get(
    `/twins/${twinId}/sensor/${sensorId}/history?minutes=${minutes}`
  );
  return response.data;
};

export const getAllLatest = async (twinId: string) => {
  const response = await API.get(`/twins/${twinId}/sensors/latest-all`);
  return response.data;
};