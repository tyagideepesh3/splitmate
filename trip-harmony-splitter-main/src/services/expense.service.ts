import { Expense } from "@/types";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
export const getExpenses = async (groupId: string) => {
  const response = await axios.get(`${apiUrl}group/${groupId}`);
  return response.data;
};

export const createExpense = async (
  expense: Omit<Expense[], "id" | "groupId">
) => {
  const response = await axios.post(`${apiUrl}expense`, expense);
  return response.data;
};
