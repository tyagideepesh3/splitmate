import { Router } from "express";
import { Expense, Group } from "../uitls/types/type";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const expenseRoute = Router();

expenseRoute.post("/", async (req, res) => {
  console.log(req.body);
  const expenseBody: Expense[] = req.body;
  try {
    await Promise.all(
      expenseBody.map((expense) => {
        return prisma.expense.update({
          where: {
            id: expense.id,
          },
          data: {
            amount: expense.amount,
            updatedAt: new Date(),
          },
        });
      })
    );
    res.status(200).json({ message: "Expenses updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Unable to update expenses" });
  }
});

export default expenseRoute;
