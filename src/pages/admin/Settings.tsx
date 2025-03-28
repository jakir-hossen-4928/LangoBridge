import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Loading from '@/components/Loading';
import { useAuth } from '@/context/AuthContext';

const AdminSettings: React.FC = () => {
  const { user, token } = useAuth();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async () => {
    if (!token) {
      toast.error('You must be logged in to update settings.');
      return;
    }

    if (!currentPassword) {
      toast.error('Current password is required to make changes.');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Verify current password
      const loginResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: currentPassword,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.error || 'Current password is incorrect');
      }

      // Step 2: Update email and/or password
      const updates = {};
      if (email !== user.email) updates.email = email;
      if (newPassword) updates.newPassword = newPassword;

      if (Object.keys(updates).length === 0) {
        toast.info('No changes to save.');
        setIsLoading(false);
        return;
      }

      const updateResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/update-account`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentEmail: user.email,
          ...updates,
        }),
      });

      const updateData = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updateData.error || 'Failed to update account');
      }

      toast.success(updateData.message || 'Account settings updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Error updating settings:', error.message, error.stack);
      toast.error(error.message || 'Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">

      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>

      <div className="space-y-6">
        <Card className="opacity-50 pointer-events-none">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure general app settings (Disabled)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-toggle">AI Features</Label>
                <p className="text-sm text-muted-foreground">
                  Enable AI-powered language suggestions and examples
                </p>
              </div>
              <Switch id="ai-toggle" checked={true} disabled />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-approve">Auto-approve Word Requests</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve word requests from verified users
                </p>
              </div>
              <Switch id="auto-approve" checked={false} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h-8z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;