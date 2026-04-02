import axios from "axios";

const axiosLocal = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
export default axiosLocal;
