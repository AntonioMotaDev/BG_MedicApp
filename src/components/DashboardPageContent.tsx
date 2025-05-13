
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);


  useEffect(() => {
    setIsClient(true); // Component has mounted
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
      <div className="flex items-center justify-center flex-grow py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center flex-grow py-10">
        <p>Redirecting to login...</p>
        <Loader2 className="ml-2 h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
     <>
        <PatientManagementPage initialPatients={initialPatients} />
     </>
  );
};

export default DashboardPageContent;
