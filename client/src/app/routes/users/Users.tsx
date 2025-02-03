'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { PageLayout } from '@/app/components/layouts/page-layout';
import { PageHeading } from '@/app/components/page-heading';
import {
  useCreateUser,
  useDeleteUser,
  useGetUsers,
  useUpdateUser,
} from '@/hooks/useUserManagement';
import { User } from '@/providers/AuthProvider';
import { ErrorPage } from '@/app/components/error';
import { LoadingPage } from '@/app/components/loading';
import createDialog from '@/components/ui/createDialog';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BotIcon,
  Edit2Icon,
  MailIcon,
  PlusIcon,
  Trash2Icon,
  User2Icon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const UserManagement = () => {
  const { user: loggedInUser, sendVerificationEmail } = useAuth();
  // get all users
  const {
    data: users,
    isLoading: isUsersLoading,
    error: isUsersError,
  } = useGetUsers();
  // delete user
  const { mutateAsync: deleteUser, isPending: isDeleteUserPending } =
    useDeleteUser();
  // update user
  const { mutateAsync: updateUser, isPending: isUpdateUserPending } =
    useUpdateUser();
  // create user
  const { mutateAsync: addUser } = useCreateUser();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const humanUsers = users?.data?.filter((user) => user.role !== 'Bot');
  const botUsers = users?.data?.filter((user) => user.role === 'Bot');

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    const isUpdated =
      JSON.stringify(selectedUser) !== JSON.stringify(updatedUser);
    if (!selectedUser) {
      console.error('No user selected');
      return;
    }
    if (!selectedUser._id) {
      console.error('User has no ID');
      return;
    }

    if (!isUpdated) {
      return toast.error('No changes detected');
    }

    const res = await updateUser({ id: selectedUser._id, update: updatedUser });
    if (res.status === 200) {
      toast.success('User updated successfully');
    } else {
      toast.error('Failed to update user');
    }
  };

  async function handleDeleteUser(user: User) {
    if (
      user._id === loggedInUser?._id ||
      user.role === 'Bot' ||
      user.isSuper ||
      user.role === 'Admin'
    ) {
      return toast.error('You cannot delete your this account');
    }
    if (loggedInUser?.role !== 'Admin') {
      toast.error('You do not have permission to delete this user');
      return;
    }
    const confirm = await createDialog({
      title: 'Confirm Delete',
      details: (
        <div className='space-y-2'>
          <p>Are you sure you want to delete this user?</p>
          <p className='text-foreground/60'>User: {user.email}</p>
          <p className='p-2 bg-destructive/10 rounded-md text-destructive text-sm'>
            This cannot be undone
          </p>
        </div>
      ),
    });
    if (!confirm) return;
    const res = await deleteUser(user._id);
    if (res.status === 200) {
      toast.success('User deleted successfully');
    } else {
      toast.error('Failed to delete user');
    }
  }

  const handleResetPassword = () => {
    toast.warning('Password reset not implemented');
  };

  const handleAddUser = async (newUser: Partial<User>) => {
    try {
      const res = await addUser(newUser);
      if (res.status === 201) {
        toast.success('User added successfully');
        setIsAddUserOpen(false);
      } else {
        toast.error('Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('An error occurred while adding the user');
    }
  };

  const handleSendEmailVerification = async (user: User) => {
    await sendVerificationEmail(user.email, (res) => {
      if (res.status === 200) {
        toast.success('Email verification sent successfully');
      } else {
        toast.error('Failed to send email verification');
      }
    });
  };

  if (isUsersLoading) {
    return <LoadingPage />;
  }

  if (isUsersError) {
    return <ErrorPage error={isUsersError} />;
  }

  return (
    <PageLayout>
      <PageHeading className='mb-6'>User Management</PageHeading>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <User2Icon className='size-6' />
            <span>Users</span>
          </CardTitle>

          <Button
            onClick={() => setIsAddUserOpen(true)}
            className='mb-4'
            size={'icon'}
          >
            <PlusIcon className='size-4' />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {humanUsers?.map((user) => (
                <TableRow
                  key={user._id}
                  className={cn('', {
                    'bg-primary/5': user._id === selectedUser?._id,
                    'bg-destructive/15':
                      !user.emailVerified && !user.phoneVerified,
                  })}
                >
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>
                    {user.email}
                    {user.emailVerified ? '✅' : '❌'}
                  </TableCell>
                  <TableCell>
                    {user.phone}
                    {user.phoneVerified ? '✅' : '❌'}
                  </TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button
                      variant='outline'
                      size='icon'
                      className={cn('mr-2', {
                        hidden:
                          user.role === 'Bot' ||
                          user.isSuper ||
                          user.role === 'Admin',
                      })}
                      onClick={() => {
                        setSelectedUser(user);
                        setIsAddUserOpen(true);
                      }}
                      disabled={isUpdateUserPending}
                    >
                      <Edit2Icon className='size-4' />
                    </Button>
                    <Button
                      variant='destructive'
                      size='icon'
                      className={cn('mr-2', {
                        hidden:
                          user.role === 'Bot' ||
                          user.isSuper ||
                          user.role === 'Admin',
                      })}
                      onClick={async () => await handleDeleteUser(user)}
                      disabled={isDeleteUserPending}
                    >
                      <Trash2Icon className='size-4' />
                    </Button>
                    {!user.emailVerified && (
                      <Button
                        title='Send Email Verification'
                        variant='outline'
                        size='icon'
                        onClick={() => handleSendEmailVerification(user)}
                      >
                        <MailIcon className='size-4' />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card className='mt-6'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <BotIcon className='size-6' />
            <span>System Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>

                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {botUsers?.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>

                  <TableCell>{user.status}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isAddUserOpen || !!selectedUser}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddUserOpen(false);
            setSelectedUser(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Add User'}</DialogTitle>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSubmit={selectedUser ? handleUpdateUser : handleAddUser}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Password Reset</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to reset the password for this user?</p>
          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() => setIsResetPasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>Reset Password</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

function UserForm({
  user,
  onSubmit,
}: {
  user: Partial<User> | null;
  onSubmit: (user: Partial<User>) => void;
}) {
  const [formData, setFormData] = useState<Partial<User>>(
    user || {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      status: 'Active',
      role: 'User',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='firstName'>First Name</Label>
        <Input
          id='firstName'
          name='firstName'
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor='lastName'>Last Name</Label>
        <Input
          id='lastName'
          name='lastName'
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>
      <div className={cn('', { hidden: user?.role === 'Bot' })}>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          name='email'
          type='email'
          value={formData.email || ''}
          onChange={handleChange}
          required
        />
      </div>
      {!user && (
        <div>
          <Label htmlFor='password'>Temporary Password</Label>
          <Input
            id='password'
            name='password'
            type='password'
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
      )}
      <div className={cn('', { hidden: user?.role === 'Bot' })}>
        <Label htmlFor='phone'>Phone</Label>
        <Input
          id='phone'
          name='phone'
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>
      <div className={cn('', { hidden: user?.role === 'Bot' })}>
        <Label htmlFor='status'>Status</Label>
        <Select
          name='status'
          value={formData.status}
          onValueChange={handleSelectChange('status')}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='Active'>Active</SelectItem>
            <SelectItem value='Inactive'>Inactive</SelectItem>
            <SelectItem value='Pending'>Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className={cn('', { hidden: user?.role === 'Bot' })}>
        <Label htmlFor='role'>Role</Label>
        <Select
          name='role'
          value={formData.role}
          onValueChange={handleSelectChange('role')}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select role' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='User'>User</SelectItem>
            <SelectItem value='Admin'>Admin</SelectItem>
            <SelectItem value='Bot'>Bot</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type='submit'
        disabled={JSON.stringify(user) === JSON.stringify(formData)}
      >
        {user ? 'Update User' : 'Add User'}
      </Button>
    </form>
  );
}
