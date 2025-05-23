import { Request } from "express";

export interface Member {
  id: string;
  name: string;
  email: string;
  password?: string;
}
export interface CustomRequestHeaders extends Request {
  user?: User;
}
export interface User {
  id: string;
  name: string;
  email: string;
}
export interface Split {
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string; // Member ID
  date: string;
  splits?: Split[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: Member[];
  expenses: Expense[];
  createdAt: string;
}

export interface Balance {
  from: string;
  to: string;
  amount: number;
}
