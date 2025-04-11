import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export function auth(req: any, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ message: "unauthorized user" });
  } else {
    token.startsWith("Bearer ");
    const actualToken = token.split(" ")[1];
    try {
      jwt.verify(
        actualToken,
        process.env.JWT_SECRET || "your_jwt_secret",
        (err: any, user: any) => {
          if (err) {
            res.status(401).json({ message: "unauthorized user", error: err });
            return;
          } else {
            req.user = user;
          }
        }
      );
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired token", error });
      return;
    }
  }
}
