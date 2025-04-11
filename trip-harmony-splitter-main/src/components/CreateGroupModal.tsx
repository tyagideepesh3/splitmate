
import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Group } from '@/types';

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: (group: Omit<Group, 'id' | 'expenses' | 'createdAt'>) => void;
}

interface FormData {
  name: string;
  description: string;
  memberName: string;
  memberEmail: string;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ 
  open, 
  onOpenChange,
  onCreateGroup,
}) => {
  const [members, setMembers] = React.useState<{name: string; email?: string}[]>([]);
  
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      memberName: '',
      memberEmail: '',
    }
  });

  const memberName = watch('memberName');
  
  const addMember = () => {
    if (!memberName.trim()) return;
    
    setMembers([
      ...members, 
      { 
        name: memberName.trim(), 
        email: watch('memberEmail').trim() || undefined 
      }
    ]);
    
    reset({
      ...watch(),
      memberName: '',
      memberEmail: '',
    });
  };
  
  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };
  
  const onSubmit = (data: FormData) => {
    // Add last member if there's input
    if (memberName.trim()) {
      addMember();
    }
    
    onCreateGroup({
      name: data.name,
      description: data.description,
      members: members.map((member, index) => ({
        id: `member-${Date.now()}-${index}`,
        name: member.name,
        email: member.email,
      })),
    });
    
    // Reset form
    reset();
    setMembers([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Trip</DialogTitle>
            <DialogDescription>
              Add a new trip to split expenses with your friends.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Trip Name</Label>
              <Input
                id="name"
                placeholder="Summer Vacation 2025"
                {...register('name', { required: 'Trip name is required' })}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Beach trip with friends"
                className="resize-none"
                {...register('description')}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Members</Label>
              
              <div className="flex flex-col gap-2">
                {members.map((member, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-accent">
                    <div className="flex-1">
                      <div className="font-medium">{member.name}</div>
                      {member.email && <div className="text-sm text-muted-foreground">{member.email}</div>}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 mt-2">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="memberName">Name</Label>
                  <Input
                    id="memberName"
                    placeholder="John Doe"
                    {...register('memberName')}
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="memberEmail">Email (Optional)</Label>
                  <Input
                    id="memberEmail"
                    placeholder="john@example.com"
                    type="email"
                    {...register('memberEmail')}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="self-end"
                  onClick={addMember}
                  disabled={!memberName.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={!watch('name') || members.length === 0}>
              Create Trip
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
