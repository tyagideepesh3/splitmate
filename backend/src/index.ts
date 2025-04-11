import { PrismaClient } from "@prisma/client";
import userRoute from "./routes/user.route";
import express from "express";
import groupRoute from "./routes/group.route";
import cors from "cors";
import expenseRoute from "./routes/expense.route";
import bodyParser from "body-parser";

const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoute);
app.use("/group", groupRoute);
app.use("/expense", expenseRoute);
app.get("/", async (req, res) => {
  res.send("Hello World!");
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
