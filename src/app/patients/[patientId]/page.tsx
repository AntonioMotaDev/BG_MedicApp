import { FC } from 'react';
import type { Patient } from "@/lib/schema";
import { Separator } from "@/components/ui/separator";
import { getPatientById } from "@/app/actions"; // Assuming an action exists to get a single patient by ID
import { notFound } from 'next/navigation';

interface PatientDetailsPageProps {
  params: { patientId: string };
}

const PatientDetailsPage: FC<PatientDetailsPageProps> = async ({ params }) => {
  const patient = await getPatientById(params.patientId);

  if (!patient) {
    notFound(); // Show a 404 page if the patient is not found
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Detalles del Paciente</h1>
      <div className="space-y-6 text-sm">
        <div>
          <h3 className="text-lg font-semibold mb-2">Datos Personales</h3>
          <p><strong>Nombre Completo:</strong> {patient.firstName} {patient.paternalLastName} {patient.maternalLastName}</p>
          <p><strong>Edad:</strong> {patient.age} años</p>
          {patient.sex && <p><strong>Sexo:</strong> {patient.sex}</p>}
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2">Dirección</h3>
          <p><strong>Calle:</strong> {patient.street}</p>
          <p><strong>Número Exterior:</strong> {patient.exteriorNumber}</p>
          {patient.interiorNumber && <p><strong>Número Interior:</strong> {patient.interiorNumber}</p>}
          <p><strong>Colonia:</strong> {patient.neighborhood}</p>
          <p><strong>Ciudad:</strong> {patient.city}</p>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2">Contacto y Otros</h3>
          <p><strong>Teléfono:</strong> {patient.phone}</p>
          {patient.insurance && <p><strong>Derechohabiencia:</strong> {patient.insurance}</p>}
          {patient.responsiblePerson && <p><strong>Persona Responsable:</strong> {patient.responsiblePerson}</p>}
        </div>
        {/* Add other patient details here as needed */}
      </div>
    </div>
  );
};

export default PatientDetailsPage; 