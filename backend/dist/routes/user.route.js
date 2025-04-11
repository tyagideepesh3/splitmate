"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const userRoute = (0, express_1.Router)();
userRoute.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const user = prisma.user.findUnique({
        where: {
            email: req.body.email.toLowerCase(),
        },
    });
    if (user === null) {
        res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = yield bcryptjs_1.default.hash(req.body.password, 10);
    const newUser = yield prisma.user.create({
        data: {
            id: (0, uuid_1.v4)(),
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password: hashedPassword,
        },
    });
    //create a token for the user
    const token = jsonwebtoken_1.default.sign({ id: newUser.id, name: newUser.name, email: newUser.email }, process.env.JWT_SECRET || "your_jwt_secret", {
        expiresIn: "1h",
    });
    res.status(201).json({ user: newUser, token });
}));
userRoute.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
        where: {
            email: req.body.email.toLowerCase(),
        },
    });
    if (user === null) {
        res.status(400).json({ error: "User email or password is incorrect" });
        return;
    }
    const isPasswordCorrect = yield bcryptjs_1.default.compare(req.body.password, user.password);
    if (!isPasswordCorrect) {
        res.status(400).json({ error: "User email or password is incorrect" });
    }
    //create a token for the user
    const token = jsonwebtoken_1.default.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET || "your_jwt_secret", {
        expiresIn: "1h",
    });
    res.status(200).json({ user, token });
}));
exports.default = userRoute;
