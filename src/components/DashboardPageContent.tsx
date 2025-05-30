"use client";

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PatientManagementPage from "@/components/PatientManagementPage";
import PatientForm from "@/components/PatientForm";
import type { Patient } from "@/lib/schema";
import { Loader2, ArrowLeftCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DashboardPageContentProps {
  initialPatients: Patient[];
}

const DashboardPageContent: FC<DashboardPageContentProps> = ({ initialPatients }) => {
  const router = useRouter();
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

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

  const handleAddPatientClick = () => {
    setIsAddFormOpen(true);
  };

  const closeAddForm = () => {
    setIsAddFormOpen(false);
    // Server actions use revalidatePath("/") which should update initialPatients prop from parent.
  };

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
     <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Patient Records</h2>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleAddPatientClick} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
              <UserPlus className="mr-2 h-5 w-5" /> Add New Patient
            </Button>
            <Link href="/main-menu" passHref legacyBehavior>
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeftCircle className="mr-2 h-5 w-5" />
                Back to Main Menu
              </Button>
            </Link>
          </div>
        </div>
        
        <PatientManagementPage initialPatients={initialPatients} />

        <Dialog open={isAddFormOpen} onOpenChange={(isOpen) => {
            if (!isOpen) closeAddForm(); // Ensure form closes correctly
            else setIsAddFormOpen(true);
        }}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
                <DialogTitle>Add New Patient Record</DialogTitle>
                <DialogDescription>
                Fill in the form to add a new patient record.
                </DialogDescription>
            </DialogHeader>
            <PatientForm 
              onClose={closeAddForm} 
              onSubmit={async (data) => {
                try {
                  // Implementar la lógica de guardado aquí
                  closeAddForm();
                } catch (error) {
                  console.error('Error saving patient:', error);
                }
              }}
            />
            </DialogContent>
        </Dialog>
     </div>
  );
};

export default DashboardPageContent;
