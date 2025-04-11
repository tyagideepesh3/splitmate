import { Group } from "@/types";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export const getGroups = async () => {
  const response = await axios.get(`${apiUrl}group`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem(
        "trip-harmonizer-current-user-token"
      )}`,
    },
  });
  return response.data;
};

export const createGroup = async (group: Group) => {
  // console.log(process.env.VITE_API_URL, group);
  const response = await axios.post(`${apiUrl}group`, group, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem(
        "trip-harmonizer-current-user-token"
      )}`,
    },
  });
  return response.data;
};

export const getGroup = async (groupId: string) => {
  const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/group`);
  return response.data;
};
