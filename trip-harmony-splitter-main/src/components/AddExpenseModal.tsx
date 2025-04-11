import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Member, Expense, Split } from "@/types";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expense: Omit<Expense, "id" | "groupId">) => void;
  members: Member[];
}

interface FormData {
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  splitType: "equal" | "custom";
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  open,
  onOpenChange,
  onAddExpense,
  members,
}) => {
  const [splits, setSplits] = useState<Split[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<
    Record<string, boolean>
  >({});

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      description: "",
      amount: 0,
      paidBy: members.length > 0 ? members[0].id : "",
      date: new Date().toISOString().split("T")[0],
      splitType: "equal",
    },
  });

  const amount = watch("amount");
  const splitType = watch("splitType");

  // Initialize splits and selected members when modal opens or members change
  useEffect(() => {
    if (members.length > 0) {
      const initialSelectedMembers: Record<string, boolean> = {};
      members.forEach((member) => {
        initialSelectedMembers[member.id] = true;
      });
      setSelectedMembers(initialSelectedMembers);

      const equalShare = amount / members.length;
      setSplits(
        members.map((member) => ({
          memberId: member.id,
          amount: equalShare,
        }))
      );
    }
  }, [members, open]);

  // Update splits when amount, split type, or selected members change
  useEffect(() => {
    if (splitType === "equal" && amount > 0) {
      const participating = members.filter(
        (member) => selectedMembers[member.id]
      );
      if (participating.length === 0) return;

      const equalShare = amount / participating.length;

      const newSplits = members.map((member) => ({
        memberId: member.id,
        amount: selectedMembers[member.id] ? equalShare : 0,
      }));

      setSplits(newSplits);
    }
  }, [amount, splitType, members, selectedMembers]);

  const updateCustomSplit = (memberId: string, newAmount: number) => {
    setSplits(
      splits.map((split) =>
        split.memberId === memberId ? { ...split, amount: newAmount } : split
      )
    );
  };

  const handleMemberToggle = (memberId: string, checked: boolean) => {
    const newSelectedMembers = { ...selectedMembers, [memberId]: checked };
    setSelectedMembers(newSelectedMembers);

    // If unchecking a member, set their split to 0
    if (!checked) {
      setSplits(
        splits.map((split) =>
          split.memberId === memberId ? { ...split, amount: 0 } : split
        )
      );
    } else if (splitType === "equal") {
      // If checking a member and equal split, recalculate all splits
      const participating = members.filter(
        (member) => newSelectedMembers[member.id]
      );
      const equalShare = amount / participating.length;

      setSplits(
        splits.map((split) =>
          newSelectedMembers[split.memberId]
            ? { ...split, amount: equalShare }
            : { ...split, amount: 0 }
        )
      );
    }
  };

  const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);
  const isBalanced = Math.abs(totalSplitAmount - amount) < 0.01;

  const onSubmit = (data: FormData) => {
    // Filter out any splits where amount is 0
    const filteredSplits = splits.filter((split) => split.amount > 0);

    onAddExpense({
      description: data.description,
      amount: data.amount,
      paidBy: data.paidBy,
      date: data.date,
      splits: filteredSplits,
    });

    reset();
    onOpenChange(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const activeMembers = members.filter((member) => selectedMembers[member.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Add a new expense to your trip group.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Dinner at Restaurant"
                {...register("description", {
                  required: "Description is required",
                })}
              />
              {errors.description && (
                <p className="text-destructive text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="100.00"
                {...register("amount", {
                  required: "Amount is required",
                  valueAsNumber: true,
                  min: {
                    value: 0.01,
                    message: "Amount must be greater than 0",
                  },
                })}
              />
              {errors.amount && (
                <p className="text-destructive text-sm">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paidBy">Paid By</Label>
                <Controller
                  control={control}
                  name="paidBy"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date", { required: "Date is required" })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Members</Label>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={selectedMembers[member.id] || false}
                      onCheckedChange={(checked) =>
                        handleMemberToggle(member.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`member-${member.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {member.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>How to Split</Label>
              <Tabs
                defaultValue="equal"
                value={splitType}
                onValueChange={(value) =>
                  setValue("splitType", value as "equal" | "custom")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="equal">Split Equally</TabsTrigger>
                  <TabsTrigger value="custom">Custom Amounts</TabsTrigger>
                </TabsList>

                <TabsContent value="equal" className="p-2">
                  {activeMembers.length > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Each selected person pays{" "}
                      {formatCurrency(amount / activeMembers.length)}
                    </p>
                  ) : (
                    <p className="text-sm text-destructive">
                      Please select at least one member
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="custom" className="space-y-4 p-2">
                  {members.map((member) => {
                    const isSelected = selectedMembers[member.id];
                    if (!isSelected) return null;

                    const memberSplit = splits.find(
                      (split) => split.memberId === member.id
                    );
                    return (
                      <div key={member.id} className="flex items-center gap-4">
                        <span className="flex-1">{member.name}</span>
                        <Input
                          type="number"
                          step="0.01"
                          className="w-28"
                          value={memberSplit?.amount || 0}
                          onChange={(e) =>
                            updateCustomSplit(
                              member.id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    );
                  })}

                  <div
                    className={`flex items-center justify-between font-medium ${
                      isBalanced ? "text-green-600" : "text-destructive"
                    }`}
                  >
                    <span>Total:</span>
                    <span>
                      {formatCurrency(totalSplitAmount)}{" "}
                      {isBalanced
                        ? "✓"
                        : `(${formatCurrency(amount - totalSplitAmount)})`}
                    </span>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                !watch("description") ||
                !watch("amount") ||
                !isBalanced ||
                activeMembers.length === 0
              }
            >
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
