import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Group, Member, Expense } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, ArrowLeft, Receipt } from "lucide-react";
import ExpenseCard from "./ExpenseCard";
import AddExpenseModal from "./AddExpenseModal";
import AddMemberModal from "./AddMemberModal";
import BalanceSummary from "./BalanceSummary";
import { useToast } from "@/hooks/use-toast";
import MemberBalances from "./MemberBalances";

interface GroupDetailsProps {
  group: Group;
  onAddMember: (memberId: string, member: Omit<Member, "id">) => void;
  onAddExpense: (expense: Omit<Expense, "id" | "groupId">) => void;
}

const GroupDetails: React.FC<GroupDetailsProps> = ({
  group,
  onAddMember,
  onAddExpense,
}) => {
  console.log(group);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddMember = (member: Omit<Member, "id">) => {
    const memberId = `member-${Date.now()}`;
    onAddMember(memberId, member);
    toast({
      title: "Member added",
      description: `${member.name} has been added to the group.`,
    });
  };

  const handleAddExpense = (expense: Omit<Expense, "id" | "groupId">) => {
    onAddExpense(expense);
    toast({
      title: "Expense added",
      description: `${expense.description} has been added to the group.`,
    });
  };

  // Sort expenses by date (newest first)
  const sortedExpenses = [...group.expenses]
    .filter((e) => e.amount > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpenses = group.expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Trips</span>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{group.name}</CardTitle>
            <CardDescription>
              {group.description || "No description"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="bg-muted px-4 py-2 rounded-md flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{group.members.length} members</span>
              </div>
              <div className="bg-muted px-4 py-2 rounded-md flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span>
                  {group.expenses.length} expenses (
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalExpenses)}
                  )
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsExpenseModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setIsMemberModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Add Member</span>
        </Button>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4 pt-4">
          {group.expenses.length > 0 && <MemberBalances group={group} />}
          {sortedExpenses.length === 0 ? (
            <div className="bg-muted rounded-lg p-8 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium text-lg mb-2">No expenses yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first expense to start tracking who owes whom.
              </p>
              <Button
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Expense</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  members={group.members}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="balances" className="pt-4">
          <BalanceSummary group={group} />
        </TabsContent>
      </Tabs>

      <AddExpenseModal
        open={isExpenseModalOpen}
        onOpenChange={setIsExpenseModalOpen}
        onAddExpense={handleAddExpense}
        members={group.members}
      />

      <AddMemberModal
        open={isMemberModalOpen}
        onOpenChange={setIsMemberModalOpen}
        onAddMember={handleAddMember}
      />
    </div>
  );
};

export default GroupDetails;
