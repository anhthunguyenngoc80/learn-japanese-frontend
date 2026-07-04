import axios from "axios";
import * as constant from "../constant"

const api = axios.create({
  baseURL: constant.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;