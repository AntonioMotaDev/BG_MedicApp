
"use client";

import type { NextPage } from 'next';
import LoginForm from '@/components/LoginForm';
import { Stethoscope } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if running on the client side
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (isAuthenticated === 'true') {
        router.replace('/main-menu'); // Redirect to main menu if already authenticated
      }
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <Stethoscope className="h-12 w-12 sm:h-16 sm:w-16 text-primary mb-3 sm:mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">BG MedicApp</h1>
          <p className="text-muted-foreground text-center mt-1">Welcome back! Please login to your account.</p>
        </div>
        <LoginForm />
         <footer className="text-center mt-8 text-muted-foreground text-sm">
          © {new Date().getFullYear()} BG MedicApp. All rights reserved. (For demo purposes only)
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
