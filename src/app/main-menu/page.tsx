
"use client";

import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, UserCog, LayoutGrid, Loader2 } from 'lucide-react';
// import type { Metadata } from 'next'; // For page metadata, though not directly used by "use client"

// Note: `export const metadata` won't work in a "use client" component directly.

const MainMenuPage: NextPage = () => {
  const router = useRouter();
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      if (!authStatus) {
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
      }
      setIsAuthCheckComplete(true);
    }
  }, [router]);

  if (!isClient || !isAuthCheckComplete) {
    return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <footer className="text-center p-4 text-muted-foreground text-sm border-t">
          © {new Date().getFullYear()} BG MedicApp. All rights reserved. (For demo purposes only)
        </footer>
      </div>
    );
  }

  if (!isAuthenticated) {
     return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
            <p>Redirecting to login...</p>
            <Loader2 className="ml-2 h-8 w-8 animate-spin text-primary" />
        </main>
         <footer className="text-center p-4 text-muted-foreground text-sm border-t">
          © {new Date().getFullYear()} BG MedicApp. All rights reserved. (For demo purposes only)
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1"> {/* This structure fits within SidebarInset */}
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <Card className="w-full max-w-2xl mb-8 shadow-lg rounded-lg">
          <CardHeader className="text-center p-4 sm:p-6">
            <LayoutGrid className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-2xl sm:text-3xl">Main Menu</CardTitle>
            <CardDescription>Select an option to proceed.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
            <Button asChild variant="outline" size="lg" className="w-full h-24 sm:h-28 md:h-32 text-base md:text-lg flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow rounded-lg p-4">
              <Link href="/">
                <Users className="h-8 w-8 mb-2 text-primary" />
                Manage Patients
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full h-24 sm:h-28 md:h-32 text-base md:text-lg flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow rounded-lg p-4">
              <Link href="/profile">
                <UserCog className="h-8 w-8 mb-2 text-accent" />
                User Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
         <p className="text-sm text-muted-foreground text-center">
            Tip: You can also use the sidebar for navigation.
          </p>
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm border-t">
        © {new Date().getFullYear()} BG MedicApp. All rights reserved. (For demo purposes only)
      </footer>
    </div>
  );
};

export default MainMenuPage;
