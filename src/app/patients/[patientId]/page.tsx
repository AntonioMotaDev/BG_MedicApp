import { FC } from 'react';
import { getPatientById } from "@/app/actions";
import { notFound, useRouter } from 'next/navigation'; // useRouter might not be needed here if Button uses Link
import type { Metadata, ResolvingMetadata } from 'next';
import PatientDetailsClient from "@/components/PatientDetailsClient"; // Assuming this component exists
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PatientDetailsPageProps {
  params: { patientId: string };
}

export async function generateMetadata(
  { params }: PatientDetailsPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const patient = await getPatientById(params.patientId);
  if (!patient) {
    return {
      title: "Paciente no encontrado",
    };
  }
  const fullName = `${patient.firstName} ${patient.paternalLastName} ${patient.maternalLastName || ''}`.trim();
  return {
    title: `Detalles de ${fullName}`,
    description: `Información detallada del paciente ${fullName}.`,
    // openGraph: {
    //   images: ['/some-specific-page-image.jpg'],
    // },
  };
}

const PatientDetailsPage: FC<PatientDetailsPageProps> = async ({ params }) => {
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
