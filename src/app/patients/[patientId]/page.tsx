import { getPatientById } from "@/app/actions";
import { notFound } from 'next/navigation';
import PatientDetailsClient from "@/components/PatientDetailsClient";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PatientDetailsPageProps {
  params: { patientId: string };
}

const PatientDetailsPage = async ({ params }: PatientDetailsPageProps) => {
  const patient = await getPatientById(params.patientId);

  if (!patient) {
    notFound(); 
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Detalles del Paciente</h1>
        <Button asChild variant="outline">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a la lista
          </Link>
        </Button>
      </div>
      <PatientDetailsClient patient={patient} />
    </div>
  );
};

export default PatientDetailsPage;
