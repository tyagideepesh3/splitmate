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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const expenseRoute = (0, express_1.Router)();
expenseRoute.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const expenseBody = req.body;
    try {
        yield Promise.all(expenseBody.map((expense) => {
            return prisma.expense.update({
                where: {
                    id: expense.id,
                },
                data: {
                    amount: expense.amount,
                    updatedAt: new Date(),
                },
            });
        }));
        res.status(200).json({ message: "Expenses updated successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Unable to update expenses" });
    }
}));
exports.default = expenseRoute;
