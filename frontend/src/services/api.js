import axios from "axios";

const API_URL = "https://testing2-mc2o.onrender.com"; // Base URL of the backend

export const insertKeyValue = async (key, value) => {
  return await axios.post(`${API_URL}/insert`, { key, value });
};

export const deleteKeyValue = async (key) => {
  return await axios.post(`${API_URL}/delete`, { key });
};

export const modifyKeyValue = async (key, value) => {
  return await axios.post(`${API_URL}/modify`, { key, value });
};

export const fetchVisualization = async () => {
  return await axios.get(`${API_URL}/visualize`);
};
