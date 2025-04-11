import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { CustomRequestHeaders, Group, User } from "../uitls/types/type";
import { v4 as uuidv4 } from "uuid";
import { auth } from "../middleware/auth.middleware";

const prisma = new PrismaClient();
const groupRoute = Router();

groupRoute.get("/", auth, async (req: CustomRequestHeaders, res) => {
  const user: User = req.user as User;
  const groups = await prisma.group.findMany({
    where: {
      Expense: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      Expense: true,
    },
  });
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: groups
          .map((group) => group.Expense.map((exp) => exp.userId))
          .flat(),
      },
    },
  });
  const finalGroup: Group[] = groups.map((grp) => {
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
});

groupRoute.post("/", auth, async (req, res) => {
  const groubBody: Group = req.body;
  let groupId: string = "";
  try {
    await prisma.$transaction(async (txn) => {
      const grp = await txn.group.create({
        data: {
          id: uuidv4(),
          name: groubBody.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      groupId = grp.id;
      const memberEmails = groubBody.members.map((member) =>
        member.email.toLowerCase()
      );
      const dbUsers = await txn.user.findMany({
        where: {
          email: {
            in: memberEmails,
          },
        },
      });
      const usersToAdd = groubBody.members
        .filter(
          (member) =>
            !dbUsers.find(
              (user) => user.email.toLowerCase() === member.email.toLowerCase()
            )
        )
        .map((u) => {
          return {
            id: uuidv4(),
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
          id: uuidv4(),
          userId: userId,
          groupId: groupId,
          amount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
      await txn.expense.createMany({
        data: expense_init_list,
        skipDuplicates: true,
      });
    });
    const addedGroup = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        Expense: true,
      },
    });
    const addedUsers = await prisma.user.findMany({
      where: {
        id: {
          in: addedGroup?.Expense.map((exp) => exp.userId),
        },
      },
    });
    if (addedGroup === null) {
      throw new Error("Group not found");
    }
    const finalGroup: Group = {
      id: addedGroup?.id || "",
      name: addedGroup?.name || "",
      description: "",
      members: addedUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      })),
      createdAt: addedGroup.createdAt.toUTCString(),
      expenses:
        addedGroup?.Expense.map((u) => {
          return {
            id: u.id,
            groupId: u.groupId,
            description: "",
            amount: u.amount,
            paidBy: u.userId,
            date: u.createdAt.toUTCString(),
          };
        }) || [],
    };
    res.json({ group: finalGroup });
  } catch (error) {
    throw error;
  }
});

groupRoute.get("/:id", async (req, res) => {
  const group = await prisma.group.findUnique({
    where: {
      id: req.params.id,
    },
  });
  res.json({ group });
});

export default groupRoute;
