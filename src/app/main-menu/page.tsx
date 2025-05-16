
"use client";

import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, UserCog, LayoutGrid, Loader2 } from 'lucide-react';
import type { Metadata } from 'next'; // For page metadata, though not directly used by "use client"

// Note: `export const metadata` won't work in a "use client" component directly.
// Metadata for client pages should be handled in a parent server component or layout if dynamic,
// or can be set statically if the page component itself is a server component and this content is moved.
// For simplicity, if static, it can be in a layout specific to this route group or in RootLayout.
// Given this is a "use client" page, we'll imply metadata is handled by RootLayout or a future specific layout.

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
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <Card className="w-full max-w-2xl mb-8 shadow-lg rounded-lg">
          <CardHeader className="text-center">
            <LayoutGrid className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-3xl">Main Menu</CardTitle>
            <CardDescription>Select an option to proceed.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
            <Link href="/" passHref legacyBehavior>
              <Button variant="outline" size="lg" className="w-full h-28 md:h-32 text-base md:text-lg flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow rounded-lg p-4">
                <Users className="h-8 w-8 mb-2 text-primary" />
                Manage Patients
              </Button>
            </Link>
            <Link href="/profile" passHref legacyBehavior>
              <Button variant="outline" size="lg" className="w-full h-28 md:h-32 text-base md:text-lg flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow rounded-lg p-4">
                <UserCog className="h-8 w-8 mb-2 text-accent" />
                User Profile
              </Button>
            </Link>
            {/* Example for a future button
            <Button variant="outline" size="lg" className="w-full h-28 md:h-32 text-base md:text-lg flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow rounded-lg p-4" disabled>
              <Settings className="h-8 w-8 mb-2 text-muted-foreground" />
              Settings (Soon)
            </Button>
            */}
          </CardContent>
        </Card>
         <p className="text-sm text-muted-foreground">
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

// Static metadata can be defined in a layout.tsx file within an app/main-menu/layout.tsx
// or for the whole app in src/app/layout.tsx if it's general.
// For a client component, if you need dynamic metadata, use the 'use client' component
// to fetch data and then pass it to a Server Component that renders metadata tags,
// or use a third-party library if that's simpler for your use case.
// Since metadata is static here, it's better in RootLayout or a specific group layout.
// For this exercise, we will assume title is set by RootLayout or a higher order component.
// export const metadata: Metadata = {
// title: 'BG MedicApp - Main Menu',
// description: 'Main menu for BG MedicApp.',
// };
