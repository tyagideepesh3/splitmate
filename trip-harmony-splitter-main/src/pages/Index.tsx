import React, { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Group, AppState, Member, Expense } from "@/types";
import Layout from "@/components/Layout";
import GroupList from "@/components/GroupList";
import CreateGroupModal from "@/components/CreateGroupModal";
import { useParams, Navigate } from "react-router-dom";
import GroupDetails from "@/components/GroupDetails";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createGroup, getGroups } from "@/services/group.service";
import { createExpense } from "@/services/expense.service";

const Index = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [appState, setAppState] = useState<AppState>({ groups: [] });
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getGroups()
      .then((data) => {
        console.log(data);
        setAppState({
          groups: [...data.groups],
        });
      })
      .catch((err) => {
        throw err;
      });
  }, []);

  const handleCreateGroup = (
    groupData: Omit<Group, "id" | "expenses" | "createdAt">
  ) => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: groupData.name,
      description: groupData.description,
      members: groupData.members,
      expenses: [],
      createdAt: new Date().toISOString(),
    };
    createGroup(newGroup)
      .then((data) => {
        console.log(data);
        setAppState({
          ...appState,
          groups: [...appState.groups, data.group],
        });
        toast({
          title: "Trip created",
          description: `${newGroup.name} has been created successfully.`,
        });
      })
      .catch((err) => {
        throw err;
      });
  };

  const handleAddMember = (
    groupId: string,
    memberId: string,
    member: Omit<Member, "id">
  ) => {
    const newMember: Member = {
      id: memberId,
      name: member.name,
      email: member.email,
    };

    setAppState({
      ...appState,
      groups: appState.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: [...group.members, newMember],
            }
          : group
      ),
    });
  };

  const handleAddExpense = (
    groupId: string,
    expense: Omit<Expense, "id" | "groupId">
  ) => {
    const currentGroup = appState.groups.find((g) => g.id === groupId);
    if (currentGroup === null) {
      return;
    }
    let modifiedExpenses: Record<string, number> = {};
    expense.splits.forEach((split) => {
      modifiedExpenses[split.memberId] = 0;
    });
    let doesSplitContainsPayer = false;
    expense.splits.forEach((split) => {
      if (split.memberId === expense.paidBy) {
        doesSplitContainsPayer = true;
        modifiedExpenses[split.memberId] += split.amount;
      } else {
        modifiedExpenses[split.memberId] -= split.amount;
      }
    });
    if (!doesSplitContainsPayer) {
      modifiedExpenses[expense.paidBy] = expense.amount;
    }
    const newExpenses: Expense[] = currentGroup.expenses.map((expense) => {
      return {
        id: expense.id,
        groupId: expense.groupId,
        description: expense.description,
        paidBy: expense.paidBy,
        date: expense.date,
        splits: expense.splits,
        amount: modifiedExpenses[expense.paidBy] + expense.amount,
      };
    });
    createExpense(newExpenses)
      .then((data) => {
        console.log(data);
        setAppState({
          ...appState,
          groups: appState.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  expenses: [...newExpenses],
                }
              : group
          ),
        });
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  };

  // If we have a groupId param, display the group details
  if (groupId) {
    const group = appState.groups.find((g) => g.id === groupId);

    if (!group) {
      return <Navigate to="/" />;
    }

    return (
      <Layout>
        <GroupDetails
          group={group}
          onAddMember={(memberId, member) =>
            handleAddMember(groupId, memberId, member)
          }
          onAddExpense={(expense) => handleAddExpense(groupId, expense)}
        />
      </Layout>
    );
  }

  return (
    <Layout onCreateGroup={() => setIsCreateGroupModalOpen(true)}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Trips</h1>
          <Button
            onClick={() => setIsCreateGroupModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Trip</span>
          </Button>
        </div>

        <GroupList groups={appState.groups} />
      </div>

      <CreateGroupModal
        open={isCreateGroupModalOpen}
        onOpenChange={setIsCreateGroupModalOpen}
        onCreateGroup={handleCreateGroup}
      />
    </Layout>
  );
};

export default Index;
