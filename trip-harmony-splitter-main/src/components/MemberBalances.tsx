import React, { useMemo } from "react";
import { Group, Member } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

interface MemberBalancesProps {
  group: Group;
}

const MemberBalances: React.FC<MemberBalancesProps> = ({ group }) => {
  // Calculate balances
  const balances = useMemo(() => {
    const memberBalances: Record<string, number> = {};

    // Initialize all member balances to 0
    group.members.forEach((member) => {
      memberBalances[member.id] = 0;
    });

    group.expenses.forEach((expense) => {
      memberBalances[expense.paidBy] += expense.amount;
    });

    return memberBalances;
  }, [group]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Member Balance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {group.members.map((member) => {
            const balance = balances[member.id] || 0;
            const isPositive = balance > 0;
            const isZero = Math.abs(balance) < 0.01;

            return (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-md ${
                  isZero
                    ? "bg-muted"
                    : isPositive
                    ? "bg-green-50 border border-green-100"
                    : "bg-red-50 border border-red-100"
                }`}
              >
                <span className="font-medium">{member.name}</span>
                <div
                  className={`flex items-center gap-1 ${
                    isZero
                      ? "text-muted-foreground"
                      : isPositive
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {!isZero &&
                    (isPositive ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    ))}
                  <span className="font-medium">{formatCurrency(balance)}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    {isZero ? "Settled" : isPositive ? "to receive" : "to pay"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberBalances;
