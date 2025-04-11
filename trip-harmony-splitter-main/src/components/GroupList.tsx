
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, Users, Wallet } from 'lucide-react';
import { Group } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface GroupListProps {
  groups: Group[];
}

const GroupList: React.FC<GroupListProps> = ({ groups }) => {
  const navigate = useNavigate();

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted rounded-full p-6 mb-4">
          <Wallet className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">No trips yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create your first trip group to start tracking and splitting expenses with your friends.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <Card 
          key={group.id} 
          className="group-card cursor-pointer hover:border-primary"
          onClick={() => navigate(`/group/${group.id}`)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{group.name}</CardTitle>
            <CardDescription>
              {group.description || 'No description'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users size={16} />
              <span>{group.members.length} members</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet size={16} />
              <span>
                {group.expenses.length} expenses (
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(
                  group.expenses.reduce((sum, expense) => sum + expense.amount, 0)
                )}
                )
              </span>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarRange size={14} />
              <span>Created {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default GroupList;
