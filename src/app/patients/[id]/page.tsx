import { FC } from 'react';
import { getPatientById } from "@/app/actions";
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PatientDetailsClient from "@/components/PatientDetailsClient";

interface PatientDetailsPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const patient = await getPatientById(params.id);
  if (!patient) {
    return {}; // Or return a default metadata
  }
  return {
    title: `Detalles de ${patient.firstName} ${patient.paternalLastName}`,
    // Add other metadata fields as needed
  };
}

const PatientDetailsPage: FC<PatientDetailsPageProps> = async ({ params }) => {
  const patient = await getPatientById(params.id);

  if (!patient) {
    notFound(); // Show a 404 page if the patient is not found
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Detalles del Paciente</h1>
      <PatientDetailsClient patient={patient} />
    </div>
  );
};

export default PatientDetailsPage;
