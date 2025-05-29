"use client";

import { FC } from 'react';
import type { Patient } from "@/lib/schema";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, CalendarDays, MapPin, Phone, Users, Weight, Ruler, Info, Stethoscope, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PatientDetailsClientProps {
  patient: Patient;
}

const DetailItem: FC<{ icon: React.ElementType, label: string, value?: string | number | null }> = ({ icon: Icon, label, value }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-primary mt-1 shrink-0" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base text-foreground break-words">{String(value)}</p>
      </div>
    </div>
  );
};

const PatientDetailsClient: FC<PatientDetailsClientProps> = ({ patient }) => {
  const fullName = `${patient.firstName} ${patient.paternalLastName} ${patient.maternalLastName || ''}`.trim();
  
  const calculateAge = (dob?: Date): string | undefined => {
    if (!dob) return patient.age !== undefined ? `${patient.age} años` : undefined;
    const birthDate = new Date(dob);
    const today = new Date();
    let ageYears = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      ageYears--;
    }
    return `${ageYears} años`;
  };
  
  const displayAge = calculateAge(patient.dateOfBirth);

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg rounded-xl">
      <CardHeader className="bg-muted/30 p-6 rounded-t-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary rounded-full text-primary-foreground">
            <User className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl text-primary">{fullName}</CardTitle>
            {displayAge && <CardDescription className="text-base">{displayAge}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        <section>
          <h3 className="text-xl font-semibold mb-4 text-foreground border-b pb-2">Información Personal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DetailItem icon={User} label="Nombre(s)" value={patient.firstName} />
            <DetailItem icon={User} label="Apellido Paterno" value={patient.paternalLastName} />
            <DetailItem icon={User} label="Apellido Materno" value={patient.maternalLastName} />
            {patient.dateOfBirth && <DetailItem icon={CalendarDays} label="Fecha de Nacimiento" value={format(new Date(patient.dateOfBirth), 'PPP', { locale: es })} />}
            <DetailItem icon={Users} label="Sexo" value={patient.sex} />
          </div>
        </section>

        <Separator />

        <section>
          <h3 className="text-xl font-semibold mb-4 text-foreground border-b pb-2">Contacto y Dirección</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DetailItem icon={Phone} label="Teléfono" value={patient.phone} />
            <DetailItem icon={MapPin} label="Calle" value={patient.street} />
            <DetailItem icon={MapPin} label="Número Exterior" value={patient.exteriorNumber} />
            <DetailItem icon={MapPin} label="Número Interior" value={patient.interiorNumber} />
            <DetailItem icon={MapPin} label="Colonia" value={patient.neighborhood} />
            <DetailItem icon={MapPin} label="Ciudad/Municipio" value={patient.city} />
          </div>
        </section>
        
        <Separator />

        <section>
          <h3 className="text-xl font-semibold mb-4 text-foreground border-b pb-2">Información Médica y Adicional</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DetailItem icon={Weight} label="Peso (kg)" value={patient.weightKg} />
            <DetailItem icon={Ruler} label="Altura (cm)" value={patient.heightCm} />
            <DetailItem icon={Phone} label="Contacto de Emergencia" value={patient.emergencyContact} />
            <DetailItem icon={Info} label="Seguro / Derechohabiencia" value={patient.insurance} />
            <DetailItem icon={Users} label="Persona Responsable" value={patient.responsiblePerson} />
            {patient.pickupTimestamp && <DetailItem icon={Clock} label="Fecha/Hora de Recogida" value={format(new Date(patient.pickupTimestamp), 'PPP p', { locale: es })} />}
          </div>
            {patient.medicalNotes && (
                <div className="mt-4">
                    <div className="flex items-start space-x-3">
                        <Stethoscope className="h-5 w-5 text-primary mt-1 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Notas Médicas</p>
                            <div className="mt-1 p-3 bg-muted/50 rounded-md max-h-60 overflow-y-auto">
                                <p className="text-base text-foreground whitespace-pre-wrap break-words">{patient.medicalNotes}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
        
        {(patient.createdAt || patient.updatedAt) && <Separator />}
        
        <section>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-muted-foreground">
                {patient.createdAt && <p>Registro Creado: {format(new Date(patient.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</p>}
                {patient.updatedAt && <p>Última Actualización: {format(new Date(patient.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}</p>}
            </div>
        </section>

      </CardContent>
    </Card>
  );
};

export default PatientDetailsClient;
