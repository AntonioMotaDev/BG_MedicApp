
import { getPatientById } from '@/app/actions';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeftCircle, CalendarDays, Weight, Ruler, Phone, NotebookText, Info } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const patient = await getPatientById(params.id);
  if (!patient) {
    return {
      title: 'Patient Not Found | BG MedicApp',
    };
  }
  return {
    title: `${patient.fullName} - Details | BG MedicApp`,
    description: `Viewing details for patient ${patient.fullName}.`,
  };
}

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const patient = await getPatientById(params.id);

  if (!patient) {
    notFound();
  }

  const detailItemClass = "flex items-start space-x-3";
  const iconClass = "h-5 w-5 text-primary mt-1";
  const labelClass = "text-sm font-medium text-muted-foreground";
  const valueClass = "text-base";

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Patient Details</h1>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">
              <ArrowLeftCircle className="mr-2 h-5 w-5" />
              Back to Patient List
            </Link>
          </Button>
        </div>
        <Card className="w-full max-w-3xl mx-auto shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-card-foreground/5 p-6">
            <CardTitle className="text-2xl sm:text-3xl text-primary">{patient.fullName}</CardTitle>
            <CardDescription>Patient ID: {patient.id}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className={detailItemClass}>
              <CalendarDays className={iconClass} />
              <div>
                <h3 className={labelClass}>Date of Birth</h3>
                <p className={valueClass}>{patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'MMMM d, yyyy') : 'N/A'}</p>
              </div>
            </div>
            <div className={detailItemClass}>
              <Info className={iconClass} /> {/* Generic icon for Gender */}
              <div>
                <h3 className={labelClass}>Gender</h3>
                <p className={valueClass}>{patient.gender || 'N/A'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className={detailItemClass}>
                <Weight className={iconClass} />
                <div>
                  <h3 className={labelClass}>Weight</h3>
                  <p className={valueClass}>{patient.weightKg !== null && patient.weightKg !== undefined ? `${patient.weightKg} kg` : 'N/A'}</p>
                </div>
              </div>
              <div className={detailItemClass}>
                <Ruler className={iconClass} />
                <div>
                  <h3 className={labelClass}>Height</h3>
                  <p className={valueClass}>{patient.heightCm !== null && patient.heightCm !== undefined ? `${patient.heightCm} cm` : 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className={detailItemClass}>
              <Phone className={iconClass} />
              <div>
                <h3 className={labelClass}>Emergency Contact</h3>
                <p className={valueClass}>{patient.emergencyContact || 'N/A'}</p>
              </div>
            </div>
            <div className={detailItemClass}>
              <NotebookText className={iconClass} />
              <div>
                <h3 className={labelClass}>Medical Notes</h3>
                <p className={`${valueClass} whitespace-pre-wrap bg-muted/30 p-3 rounded-md border`}>{patient.medicalNotes?.trim() ? patient.medicalNotes : 'N/A'}</p>
              </div>
            </div>
            <div className={detailItemClass}>
              <CalendarDays className={iconClass} /> {/* Re-using icon for timestamp */}
              <div>
                <h3 className={labelClass}>Record Last Updated</h3>
                <p className={valueClass}>{patient.pickupTimestamp ? format(new Date(patient.pickupTimestamp), 'MMMM d, yyyy HH:mm:ss') : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm border-t">
        © {new Date().getFullYear()} BG MedicApp. All rights reserved. (For demo purposes only)
      </footer>
    </div>
  );
}

