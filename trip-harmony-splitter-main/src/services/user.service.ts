import { Member } from "@/types";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;
export const signUp = async (user: Member) => {
  try {
    const response = await axios.post(`${apiUrl}user/signup`, user);
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};
export const loginService = async (loginPayload: {
  email: string;
  password: string;
}) => {
  const response = await axios.post(`${apiUrl}user/login`, loginPayload);
  return response.data;
};
