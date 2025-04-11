import { Member } from "@/types";
import axios from "axios";

export const signUp = async (user: Member) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/user/signup`,
      user
    );
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
  const response = await axios.post(
    `http://localhost:3000/user/login`,
    loginPayload
  );
  return response.data;
};
