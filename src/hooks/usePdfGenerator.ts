import { useCallback } from 'react';
import jsPDF from 'jspdf';

interface PreHospitalRecord {
  id: string;
  patientName: string;
  fecha: string;
  createdAt: string;
  status: string;
  prioridad?: string;
  convenio?: string;
  episodio?: string;
  folio?: string;
  solicitadoPor?: string;
  horaLlamada?: string;
  horaSalida?: string;
  horaLlegada?: string;
  direccion?: string;
  lugarOcurrencia?: string;
  tipoServicio?: string;
  antecedentesPatologicos?: string[];
  historiaClinica?: string;
  medicamentos?: string;
  procedimientos?: string[];
  medicoReceptorNombre?: string;
  // Campos adicionales que pueden estar en el registro
  pupilas?: string;
  colorPiel?: string;
  piel?: string;
  temperatura?: string;
  influenciadoPor?: string[];
  negativaAtencion?: boolean;
  firmaPaciente?: string;
  firmaTestigo?: string;
}

export const usePdfGenerator = () => {
  const generatePdf = useCallback((record: PreHospitalRecord) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 20;

    // Helper function to add text with word wrap
    const addText = (text: string, x: number, y: number, maxWidth?: number) => {
      if (maxWidth) {
        const splitText = doc.splitTextToSize(text, maxWidth);
        doc.text(splitText, x, y);
        return splitText.length * 5; // Approximate line height
      } else {
        doc.text(text, x, y);
        return 5; // Single line height
      }
    };

    // Helper function to add centered text
    const addCenteredText = (text: string, y: number) => {
      const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    // Helper function to add section header
    const addSectionHeader = (title: string) => {
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      addText(title, margin, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
    };

    // Helper function to add field
    const addField = (label: string, value?: string | string[], indent = 0) => {
      const fieldValue = Array.isArray(value) 
        ? (value.length > 0 ? value.join(', ') : 'No especificado')
        : (value || 'No especificado');
      
      doc.setFont(undefined, 'bold');
      const labelHeight = addText(`${label}:`, margin + indent, yPosition, pageWidth - margin * 2);
      doc.setFont(undefined, 'normal');
      yPosition += Math.max(labelHeight, 5);
      
      const valueHeight = addText(fieldValue, margin + indent + 5, yPosition, pageWidth - margin * 2 - 5);
      yPosition += Math.max(valueHeight, 5) + 3;
      
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    };

    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    addCenteredText('REGISTRO PREHOSPITALARIO', yPosition);
    yPosition += 15;

    // Basic Information
    addSectionHeader('INFORMACIÓN BÁSICA');
    addField('ID del Registro', record.id);
    addField('Nombre del Paciente', record.patientName);
    addField('Fecha de Atención', record.fecha);
    addField('Fecha de Creación', record.createdAt ? new Date(record.createdAt).toLocaleDateString('es-ES') : undefined);
    addField('Estado del Registro', record.status);

    // Registration Data
    addSectionHeader('DATOS DEL REGISTRO');
    addField('Convenio', record.convenio);
    addField('Episodio', record.episodio);
    addField('Folio', record.folio);
    addField('Solicitado por', record.solicitadoPor);

    // Capture Data
    addSectionHeader('DATOS DE CAPTACIÓN');
    addField('Hora de Llamada', record.horaLlamada);
    addField('Hora de Salida', record.horaSalida);
    addField('Hora de Llegada', record.horaLlegada);
    addField('Dirección', record.direccion);
    addField('Lugar de Ocurrencia', record.lugarOcurrencia);
    addField('Tipo de Servicio', record.tipoServicio);

    // Medical Priority
    addSectionHeader('PRIORIDAD MÉDICA');
    addField('Prioridad', record.prioridad);
    addField('Pupilas', record.pupilas);
    addField('Color de Piel', record.colorPiel);
    addField('Condición de Piel', record.piel);
    addField('Temperatura', record.temperatura);
    addField('Influenciado por', record.influenciadoPor);

    // Medical History
    addSectionHeader('ANTECEDENTES MÉDICOS');
    addField('Antecedentes Patológicos', record.antecedentesPatologicos);
    addField('Historia Clínica', record.historiaClinica);

    // Management and Medications
    addSectionHeader('MANEJO Y MEDICAMENTOS');
    addField('Procedimientos Realizados', record.procedimientos);
    addField('Medicamentos Administrados', record.medicamentos);

    // Medical Receiver
    addSectionHeader('MÉDICO RECEPTOR');
    addField('Nombre del Médico Receptor', record.medicoReceptorNombre);

    // Refusal of Care
    addSectionHeader('NEGATIVA DE ATENCIÓN');
    addField('Negativa de Atención', record.negativaAtencion ? 'Sí' : 'No');
    addField('Firma del Paciente', record.firmaPaciente);
    addField('Firma del Testigo', record.firmaTestigo);

    // Additional empty fields commonly found in pre-hospital records
    addSectionHeader('CAMPOS ADICIONALES');
    addField('Signos Vitales - Presión Arterial', '');
    addField('Signos Vitales - Frecuencia Cardíaca', '');
    addField('Signos Vitales - Frecuencia Respiratoria', '');
    addField('Signos Vitales - Saturación de Oxígeno', '');
    addField('Escala de Glasgow', '');
    addField('Alergias Conocidas', '');
    addField('Medicamentos Habituales', '');
    addField('Observaciones Adicionales', '');

    // Footer
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition += 20;
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    addText(`Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, margin, yPosition);

    // Save the PDF
    doc.save(`registro-prehospitalario-${record.id}.pdf`);
  }, []);

  return { generatePdf };
}; 