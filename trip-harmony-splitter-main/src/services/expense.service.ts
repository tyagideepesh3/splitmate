import { Expense } from "@/types";
import axios from "axios";

export const getExpenses = async (groupId: string) => {
  const response = await axios.get(`http://localhost:3000/group/${groupId}`);
  return response.data;
};

export const createExpense = async (
  expense: Omit<Expense[], "id" | "groupId">
) => {
  const response = await axios.post(`http://localhost:3000/expense`, expense);
  return response.data;
};
