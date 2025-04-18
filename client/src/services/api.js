// Axios wrapper – edit baseURL if you proxy differently
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8001",
});

export default api;