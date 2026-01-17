'use client';

import { useState, useEffect } from 'react';
import { Search, Users, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/store/chatStore';
import type { PubUser } from '@/types/chat';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<PubUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { fetchAvailableUsers, createChat } = useChat();
  const { setCurrentChat } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setIsLoading(true);
    const users = await fetchAvailableUsers();
    setAvailableUsers(users);
    setIsLoading(false);
  };

  const handleUserToggle = (userId: number) => {
    if (chatType === 'direct') {
      // For direct chats, only allow one user selection
      setSelectedUsers((prev) =>
        prev.includes(userId) ? [] : [userId]
      );
    } else {
      // For group chats, allow multiple selections
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    if (chatType === 'group' && !groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    setIsLoading(true);

    const chatId = await createChat({
      participant_ids: selectedUsers,
      chat_type: chatType,
      name: chatType === 'group' ? groupName : undefined,
    });

    setIsLoading(false);

    if (chatId) {
      setCurrentChat(chatId);
      onClose();
      // Reset state
      setSelectedUsers([]);
      setGroupName('');
      setSearchQuery('');
    }
  };

  const filteredUsers = availableUsers.filter((user) =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
          <DialogDescription>
            Start a conversation with teachers, students, or create a group
          </DialogDescription>
        </DialogHeader>

        <Tabs value={chatType} onValueChange={(v) => {
          setChatType(v as 'direct' | 'group');
          setSelectedUsers([]); // Clear selection when changing tab
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Direct
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Group
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users available
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.includes(user.id)
                        ? 'bg-primary/10 ring-2 ring-primary'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photo || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="group" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-[250px] overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users available
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photo || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading || selectedUsers.length === 0}>
            {isLoading ? 'Creating...' : `Create ${chatType === 'group' ? 'Group' : 'Chat'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
