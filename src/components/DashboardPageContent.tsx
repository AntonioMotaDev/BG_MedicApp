
"use client";

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PatientManagementPage from "@/components/PatientManagementPage";
import type { Patient } from "@/lib/schema";
import { Loader2 } from 'lucide-react';

interface DashboardPageContentProps {
  initialPatients: Patient[];
}

const DashboardPageContent: FC<DashboardPageContentProps> = ({ initialPatients }) => {
  const router = useRouter();
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

  useEffect(() => {
    // Ensure localStorage is accessed only on the client side
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      if (!authStatus) {
        router.replace('/login');
      } else {
        setIsAuthCheckComplete(true); // Only set to true if authenticated
      }
    }
  }, [router]);

  if (!isAuthCheckComplete) {
    // Show a loader while checking authentication or redirecting
    return (
      <div className="flex items-center justify-center flex-grow py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If isAuthCheckComplete is true, it means the user is authenticated.
  return (
     <>
        <PatientManagementPage initialPatients={initialPatients} />
     </>
  );
};

export default DashboardPageContent;
