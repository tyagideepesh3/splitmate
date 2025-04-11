import React from "react";
import { format } from "date-fns";
import { Expense, Member } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Banknote, Receipt, CalendarDays, Users } from "lucide-react";

interface ExpenseCardProps {
  expense: Expense;
  members: Member[];
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, members }) => {
  const paidByMember = members.find((member) => member.id === expense.paidBy);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card className="expense-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{expense.description}</span>
          <span className="text-primary">{formatCurrency(expense.amount)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm">
            <Banknote className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              Paid by{" "}
              <span className="font-medium">
                {paidByMember?.name || "Unknown"}
              </span>
            </span>
          </div>
          <div className="flex items-center text-sm">
            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <div className="flex items-center w-full text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2" />
          <span>Split between</span>
          <div className="flex-1 flex justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex -space-x-2">
                    {/* {expense?.splits?.map((split, index) => {
                      const member = members.find(
                        (m) => m.id === split.memberId
                      );
                      return (
                        <div
                          key={split.memberId}
                          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-background"
                          style={{ zIndex: expense.splits.length - index }}
                        >
                          {member?.name.charAt(0).toUpperCase()}
                        </div>
                      );
                    })} */}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <ul className="space-y-1">
                    {/* {expense.splits.map((split) => {
                      const member = members.find(
                        (m) => m.id === split.memberId
                      );
                      return (
                        <li
                          key={split.memberId}
                          className="flex justify-between gap-4"
                        >
                          <span>{member?.name}:</span>
                          <span className="font-medium">
                            {formatCurrency(split.amount)}
                          </span>
                        </li>
                      );
                    })} */}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ExpenseCard;
