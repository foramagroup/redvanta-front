import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper: GET request
export async function get(path, params = {}) {
  try {
    const { data } = await api.get(path, { params });
    return data;
  } catch (err) {
    console.error("GET error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
}

// Helper: POST request
export async function post(path, body = {}) {
  try {
    const { data } = await api.post(path, body);
    return data;
  } catch (err) {
    console.error("POST error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
}

// Helper: PUT request
export async function put(path, body = {}) {
  try {
    const { data } = await api.put(path, body);
    return data;
  } catch (err) {
    console.error("PUT error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
}

// Helper: DELETE request
export async function remove(path) {
  try {
    const { data } = await api.delete(path);
    return data;
  } catch (err) {
    console.error("DELETE error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
}

export default { get, post, put, remove };
