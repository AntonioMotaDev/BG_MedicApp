import { NextRequest, NextResponse } from 'next/server';
import { getPreHospitalRecord, getPatientById } from '@/app/actions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id;
    
    if (!recordId) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      );
    }
    
    const record = await getPreHospitalRecord(recordId);
    
    if (!record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
    
    // Get patient information if patientId exists
    let patientName = 'Paciente no encontrado';
    let patientData = null;
    if (record.patientId) {
      try {
        const patient = await getPatientById(record.patientId);
        if (patient) {
          patientName = `${patient.firstName} ${patient.paternalLastName} ${patient.maternalLastName}`;
          patientData = {
            age: patient.age,
            sex: patient.sex,
            phone: patient.phone,
            responsiblePerson: patient.responsiblePerson,
            emergencyContact: patient.emergencyContact,
            street: patient.street,
            exteriorNumber: patient.exteriorNumber,
            interiorNumber: patient.interiorNumber,
            neighborhood: patient.neighborhood,
            city: patient.city,
            insurance: patient.insurance
          };
        }
      } catch (error) {
        console.error(`Error fetching patient ${record.patientId}:`, error);
      }
    }
    
    // Calculate completed sections and total sections
    const completedSections = Array.isArray(record.completedSections) ? record.completedSections : [];
    const totalSections = 11; // Based on the form structure
    
    // Format the record with all necessary fields
    const formattedRecord = {
      ...record,
      patientName,
      patient: patientData,
      completedSections,
      totalSections,
      // Map some fields for display consistency
      horaLlamada: record.horaLlegada,
      horaSalida: record.horaArribo,
      direccion: record.ubicacion,
      antecedentesPatologicos: record.antecedentesPatologicos || [],
      historiaClinica: record.otraPatologia || record.otroTipoAntecedente,
      lesiones: record.lesiones || [],
      procedimientos: [
        ...(record.viaAerea ? ['Vía aérea'] : []),
        ...(record.canalizacion ? ['Canalización'] : []),
        ...(record.empaquetamiento ? ['Empaquetamiento'] : []),
        ...(record.inmovilizacion ? ['Inmovilización'] : []),
        ...(record.monitor ? ['Monitor'] : []),
        ...(record.rcpBasica ? ['RCP Básica'] : []),
        ...(record.mastPna ? ['MAST/PNA'] : []),
        ...(record.collarinCervical ? ['Collarín Cervical'] : []),
        ...(record.desfibrilacion ? ['Desfibrilación'] : []),
        ...(record.apoyoVent ? ['Apoyo Ventilatorio'] : []),
        ...(record.oxigeno ? [`Oxígeno: ${record.oxigeno}`] : []),
        ...(record.otroManejo ? [record.otroManejo] : [])
      ].filter(Boolean),
    };
    
    return NextResponse.json(formattedRecord, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/prehospital-records/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pre-hospital record' },
      { status: 500 }
    );
  }
} 