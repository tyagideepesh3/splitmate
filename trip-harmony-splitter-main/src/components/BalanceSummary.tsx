import React, { useMemo } from "react";
import { Group, Member, Balance } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";

interface BalanceSummaryProps {
  group: Group;
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ group }) => {
  // Calculate balances
  const balances = useMemo(() => {
    const memberBalances: Record<string, number> = {};

    // Initialize all member balances to 0
    group.members.forEach((member) => {
      memberBalances[member.id] = 0;
    });

    // Calculate payments and debts
    group.expenses.forEach((expense) => {
      // Add the full amount to the payer
      memberBalances[expense.paidBy] += expense.amount;

      // Subtract each person's share
      // expense.splits.forEach(split => {
      //   memberBalances[split.memberId] -= split.amount;
      // });
    });

    return memberBalances;
  }, [group]);

  // Create simplified balances (who owes whom)
  const simplifiedBalances = useMemo(() => {
    const result: Balance[] = [];
    const members = [...group.members];
    const memberBalances = { ...balances };

    // Filter out balanced members
    const activeMembers = members.filter(
      (member) => Math.abs(memberBalances[member.id]) > 0.01
    );

    // Sort by balance (debtors first, then creditors)
    activeMembers.sort((a, b) => memberBalances[a.id] - memberBalances[b.id]);

    // Simplify balances
    while (activeMembers.length > 1) {
      const debtor = activeMembers[0];
      const creditor = activeMembers[activeMembers.length - 1];

      const debtorBalance = memberBalances[debtor.id];
      const creditorBalance = memberBalances[creditor.id];

      // The smaller of the two balances determines the payment amount
      const paymentAmount = Math.min(
        Math.abs(debtorBalance),
        Math.abs(creditorBalance)
      );

      if (paymentAmount > 0.01) {
        result.push({
          from: debtor.id,
          to: creditor.id,
          amount: paymentAmount,
        });
      }

      // Update balances
      memberBalances[debtor.id] += paymentAmount;
      memberBalances[creditor.id] -= paymentAmount;

      // Remove settled members
      if (Math.abs(memberBalances[debtor.id]) < 0.01) {
        activeMembers.shift();
      }
      if (Math.abs(memberBalances[creditor.id]) < 0.01) {
        activeMembers.pop();
      }
    }

    return result;
  }, [balances, group.members]);

  const getMemberById = (id: string): Member | undefined => {
    return group.members.find((member) => member.id === id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Balance Summary</span>
        </CardTitle>
        <CardDescription>See who owes whom in your group</CardDescription>
      </CardHeader>
      <CardContent>
        {simplifiedBalances.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Everyone is settled up!
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Simplified Balances</h4>
              {simplifiedBalances.map((balance, index) => {
                const fromMember = getMemberById(balance.from);
                const toMember = getMemberById(balance.to);

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-accent p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{fromMember?.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{toMember?.name}</span>
                    </div>
                    <span className="font-medium text-primary">
                      {formatCurrency(balance.amount)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 pt-2 border-t">
              <h4 className="font-medium text-sm">Individual Balances</h4>
              <div className="grid grid-cols-1 gap-2">
                {group.members.map((member) => {
                  const balance = balances[member.id] || 0;
                  const isPositive = balance > 0;
                  const isZero = Math.abs(balance) < 0.01;

                  return (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-2 rounded-md ${
                        isZero
                          ? "bg-muted"
                          : isPositive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      <span>{member.name}</span>
                      <div className="flex items-center gap-1">
                        {!isZero &&
                          (isPositive ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          ))}
                        <span className="font-medium">
                          {formatCurrency(balance)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceSummary;
