import axios from "axios";
// Use env-based API URL for builds; fallback to local dev
import { API_BASE_URL } from "@/utils/constant";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
