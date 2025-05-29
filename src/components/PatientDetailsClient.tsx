"use client";

import { FC } from 'react';
import type { Patient } from "@/lib/schema";
import { Separator } from "@/components/ui/separator";

interface PatientDetailsClientProps {
  patient: Patient;
}

const PatientDetailsClient: FC<PatientDetailsClientProps> = ({ patient }) => {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="text-lg font-semibold mb-2">Datos Personales</h3>
        <p><strong>Nombre Completo:</strong> {patient.firstName} {patient.paternalLastName} {patient.maternalLastName}</p>
        <p><strong>Edad:</strong> {patient.age} años</p>
        {/* Sex was removed from table but might be relevant here */}
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
    </div>
  );
};

export default PatientDetailsClient; 