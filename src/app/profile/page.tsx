
"use client";

import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Loader2, UserCog } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ProfilePage: NextPage = () => {
  const router = useRouter();
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState(''); // Or some other editable fields

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      const email = localStorage.getItem('userEmail');
      if (!authStatus) {
        router.replace('/login');
      } else {
        setUserEmail(email || '');
        setUserName(email?.split('@')[0] || 'User'); // Example: derive name
        setIsAuthCheckComplete(true);
      }
    }
  }, [router]);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for saving changes
    alert('Profile changes saved (not really, this is a demo).');
    // In a real app, you would call an API or server action here
    // and potentially update localStorage if userEmail changes.
  };

  if (!isAuthCheckComplete) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <footer className="text-center p-4 text-muted-foreground text-sm border-t">
          © {new Date().getFullYear()} BG MedicApp. All rights reserved. (For demo purposes only)
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex justify-center items-start">
        <Card className="w-full max-w-2xl shadow-lg rounded-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <UserCog className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">User Profile</CardTitle>
            <CardDescription>Manage your account settings and personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="userName">Display Name</Label>
                <Input 
                  id="userName" 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)} 
                  placeholder="Your display name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={userEmail} 
                  disabled // Email usually not editable directly or requires verification
                  className="cursor-not-allowed bg-muted/50"
                />
                 <p className="text-xs text-muted-foreground">Email address cannot be changed here.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password (Optional)</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  placeholder="Enter current password to change it" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password (Optional)</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  placeholder="Enter new password" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password (Optional)</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirm new password" 
                />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm border-t">
        © {new Date().getFullYear()} BG MedicApp. All rights reserved. (For demo purposes only)
      </footer>
    </div>
  );
};

export default ProfilePage;
