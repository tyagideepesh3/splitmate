import { Group } from "@/types";
import axios from "axios";

export const getGroups = async () => {
  const response = await axios.get(`http://localhost:3000/group`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem(
        "trip-harmonizer-current-user-token"
      )}`,
    },
  });
  return response.data;
};

export const createGroup = async (group: Group) => {
  //   console.log(process.env.REACT_APP_BASE_URL, group);
  const response = await axios.post(`http://localhost:3000/group`, group, {
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
