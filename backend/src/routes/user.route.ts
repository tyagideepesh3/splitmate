import { Router } from "express";
import { Expense, Group } from "../uitls/types/type";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const userRoute = Router();

userRoute.post("/signup", async (req, res) => {
  console.log(req.body);
  const user = prisma.user.findUnique({
    where: {
      email: req.body.email.toLowerCase(),
    },
  });
  if (user === null) {
    res.status(400).json({ error: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
    },
  });
  //create a token for the user
  const token = jwt.sign(
    { id: newUser.id, name: newUser.name, email: newUser.email },
    process.env.JWT_SECRET || "your_jwt_secret",
    {
      expiresIn: "1h",
    }
  );
  res.status(201).json({ user: newUser, token });
});

userRoute.post("/login", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email.toLowerCase(),
    },
  });
  if (user === null) {
    res.status(400).json({ error: "User email or password is incorrect" });
    return;
  }
  const isPasswordCorrect = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordCorrect) {
    res.status(400).json({ error: "User email or password is incorrect" });
  }
  //create a token for the user
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET || "your_jwt_secret",
    {
      expiresIn: "1h",
    }
  );
  res.status(200).json({ user, token });
});

export default userRoute;
