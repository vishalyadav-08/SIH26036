import axios from "axios";
import { HOST } from "@/config/host";

export const api = axios.create({
  baseURL: HOST.api,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
