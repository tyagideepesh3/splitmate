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
const client_1 = require("@prisma/client");
const express_1 = require("express");
const uuid_1 = require("uuid");
const auth_middleware_1 = require("../middleware/auth.middleware");
const prisma = new client_1.PrismaClient();
const groupRoute = (0, express_1.Router)();
groupRoute.get("/", auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groups = yield prisma.group.findMany({
        include: {
            Expense: true,
        },
    });
    const users = yield prisma.user.findMany({
        where: {
            id: {
                in: groups
                    .map((group) => group.Expense.map((exp) => exp.userId))
                    .flat(),
            },
        },
    });
    const finalGroup = groups.map((grp) => {
        return {
            id: grp.id,
            name: grp.name,
            description: "",
            createdAt: grp.createdAt.toUTCString(),
            members: users
                .filter((e) => grp.Expense.find((g) => g.userId === e.id))
                .map((u) => {
                return {
                    id: u.id,
                    name: u.name,
                    email: u.email,
                };
            }),
            expenses: grp.Expense.map((e) => {
                return {
                    id: e.id,
                    groupId: e.groupId,
                    description: "",
                    amount: e.amount,
                    paidBy: e.userId,
                    date: e.createdAt.toUTCString(),
                };
            }),
        };
    });
    res.json({ groups: finalGroup });
}));
groupRoute.post("/", auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groubBody = req.body;
    let groupId = "";
    try {
        yield prisma.$transaction((txn) => __awaiter(void 0, void 0, void 0, function* () {
            const grp = yield txn.group.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    name: groubBody.name,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            groupId = grp.id;
            const memberEmails = groubBody.members.map((member) => member.email.toLowerCase());
            const dbUsers = yield txn.user.findMany({
                where: {
                    email: {
                        in: memberEmails,
                    },
                },
            });
            const usersToAdd = groubBody.members
                .filter((member) => !dbUsers.find((user) => user.email.toLowerCase() === member.email.toLowerCase()))
                .map((u) => {
                return {
                    id: (0, uuid_1.v4)(),
                    name: u.name,
                    email: u.email.toLowerCase(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            });
            if (usersToAdd.length > 0) {
                res.status(400).json({
                    error: "Some user emails does not exist pls Provide correct email",
                });
            }
            const dbUserIds = dbUsers.map((user) => user.id);
            console.log([...dbUserIds]);
            const expense_init_list = [...dbUserIds].map((userId) => {
                return {
                    id: (0, uuid_1.v4)(),
                    userId: userId,
                    groupId: groupId,
                    amount: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            });
            yield txn.expense.createMany({
                data: expense_init_list,
                skipDuplicates: true,
            });
        }));
        const addedGroup = yield prisma.group.findUnique({
            where: {
                id: groupId,
            },
            include: {
                Expense: true,
            },
        });
        const addedUsers = yield prisma.user.findMany({
            where: {
                id: {
                    in: addedGroup === null || addedGroup === void 0 ? void 0 : addedGroup.Expense.map((exp) => exp.userId),
                },
            },
        });
        if (addedGroup === null) {
            throw new Error("Group not found");
        }
        const finalGroup = {
            id: (addedGroup === null || addedGroup === void 0 ? void 0 : addedGroup.id) || "",
            name: (addedGroup === null || addedGroup === void 0 ? void 0 : addedGroup.name) || "",
            description: "",
            members: addedUsers.map((user) => ({
                id: user.id,
                name: user.name,
                email: user.email,
            })),
            createdAt: addedGroup.createdAt.toUTCString(),
            expenses: (addedGroup === null || addedGroup === void 0 ? void 0 : addedGroup.Expense.map((u) => {
                return {
                    id: u.id,
                    groupId: u.groupId,
                    description: "",
                    amount: u.amount,
                    paidBy: u.userId,
                    date: u.createdAt.toUTCString(),
                };
            })) || [],
        };
        res.json({ group: finalGroup });
    }
    catch (error) {
        throw error;
    }
}));
groupRoute.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const group = yield prisma.group.findUnique({
        where: {
            id: req.params.id,
        },
    });
    res.json({ group });
}));
exports.default = groupRoute;
