import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PreHospitalRecord {
  id: string;
  patientName: string;
  patient?: {
    age?: number;
    sex?: string;
    phone?: string;
    responsiblePerson?: string;
    emergencyContact?: string;
    street?: string;
    exteriorNumber?: string;
    interiorNumber?: string;
    neighborhood?: string;
    city?: string;
    insurance?: string;
  };
  fecha: string;
  createdAt: string;
  status: string;
  convenio?: string;
  episodio?: string;
  folio?: string;
  solicitadoPor?: string;
  horaLlegada?: string;
  horaArribo?: string;
  tiempoEspera?: string;
  horaTermino?: string;
  ubicacion?: string;
  tipoServicio?: string;
  otroTipoServicio?: string;
  lugarOcurrencia?: string;
  antecedentesPatologicos?: string[];
  otraPatologia?: string;
  tipoAntecedente?: string;
  otroTipoAntecedente?: string;
  agenteCasual?: string;
  cinematica?: string;
  medidaSeguridad?: string;
  lesiones?: any[];
  viaAerea?: boolean;
  canalizacion?: boolean;
  empaquetamiento?: boolean;
  inmovilizacion?: boolean;
  monitor?: boolean;
  rcpBasica?: boolean;
  mastPna?: boolean;
  collarinCervical?: boolean;
  desfibrilacion?: boolean;
  apoyoVent?: boolean;
  oxigeno?: string;
  otroManejo?: string;
  medicamentos?: string;
  parto?: boolean;
  aborto?: boolean;
  hxVaginal?: boolean;
  fechaUltimaMenstruacion?: string;
  semanasGestacion?: string;
  ruidosCardiacosFetales?: string;
  expulsionPlacenta?: string;
  horaExpulsionPlacenta?: string;
  gesta?: string;
  partos?: string;
  cesareas?: string;
  abortos?: string;
  metodosAnticonceptivos?: string;
  negativaAtencion?: boolean;
  firmaPaciente?: string;
  firmaTestigo?: string;
  prioridad?: string;
  pupilas?: string;
  colorPiel?: string;
  piel?: string;
  temperatura?: string;
  influenciadoPor?: string[];
  otroInfluencia?: string;
  lugarOrigen?: string;
  lugarConsulta?: string;
  lugarDestino?: string;
  ambulanciaNumero?: string;
  ambulanciaPlacas?: string;
  personal?: string;
  doctor?: string;
  medicoReceptorNombre?: string;
  medicoReceptorFirma?: string;
  horaEntrega?: string;
  observaciones?: string;
  observacionesAdicionales?: string;
}

export const usePdfGenerator = () => {
  const generatePdf = useCallback(async (record: PreHospitalRecord) => {
    try {
      // Create a temporary container for the print layout
      const printContainer = document.createElement('div');
      printContainer.style.position = 'fixed';
      printContainer.style.top = '-9999px';
      printContainer.style.left = '-9999px';
      printContainer.style.width = '210mm'; // A4 width
      printContainer.style.height = 'auto';
      printContainer.style.backgroundColor = 'white';
      printContainer.style.padding = '0';
      printContainer.style.margin = '0';
      printContainer.style.zIndex = '-1000';
      
      // Import and render the PreHospitalRecordPrintLayout component
      const { PreHospitalRecordPrintLayout } = await import('@/components/PreHospitalRecordPrintLayout');
      const { createRoot } = await import('react-dom/client');
      const { createElement } = await import('react');
      
      document.body.appendChild(printContainer);
      const root = createRoot(printContainer);
      
      // Render the component
      await new Promise<void>((resolve) => {
        root.render(
          createElement(PreHospitalRecordPrintLayout, { record }),
        );
        
        // Wait for component to render
        setTimeout(resolve, 500);
      });

      // Configure html2canvas for high quality
      const canvas = await html2canvas(printContainer, {
        scale: 3, // Higher scale for better quality (3x resolution)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: printContainer.offsetWidth,
        height: printContainer.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: printContainer.offsetWidth,
        windowHeight: printContainer.offsetHeight,
        onclone: (clonedDoc) => {
          // Ensure all styles are applied in the cloned document
          const clonedContainer = clonedDoc.querySelector('div');
          if (clonedContainer) {
            clonedContainer.style.position = 'relative';
            clonedContainer.style.top = '0';
            clonedContainer.style.left = '0';
            clonedContainer.style.zIndex = '0';
          }
        }
      });

      // A4 dimensions in mm
      const a4Width = 210;
      const a4Height = 297;
      
      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16 // Higher precision for better quality
      });

      // Calculate dimensions to fit A4 while maintaining aspect ratio
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Calculate scaling to fit A4 with margins
      const marginX = 5; // 5mm margins
      const marginY = 5;
      const maxWidth = a4Width - (marginX * 2);
      const maxHeight = a4Height - (marginY * 2);
      
      const scaleX = maxWidth / (canvasWidth * 0.264583); // Convert px to mm (96 DPI)
      const scaleY = maxHeight / (canvasHeight * 0.264583);
      const scale = Math.min(scaleX, scaleY);
      
      const finalWidth = (canvasWidth * 0.264583) * scale;
      const finalHeight = (canvasHeight * 0.264583) * scale;
      
      // Center the image on the page
      const x = (a4Width - finalWidth) / 2;
      const y = marginY;

      // Add the canvas as image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');

      // Clean up
      root.unmount();
      document.body.removeChild(printContainer);

      // Save the PDF
      pdf.save(`FRAP-${record.patientName.replace(/\s+/g, '-')}-${record.id}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }, []);

  const generatePdfFromElement = useCallback(async (elementId: string, filename: string) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element not found');
      }

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
      });

      const a4Width = 210;
      const a4Height = 297;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const marginX = 5;
      const marginY = 5;
      const maxWidth = a4Width - (marginX * 2);
      const maxHeight = a4Height - (marginY * 2);
      
      const scaleX = maxWidth / (canvasWidth * 0.264583);
      const scaleY = maxHeight / (canvasHeight * 0.264583);
      const scale = Math.min(scaleX, scaleY);
      
      const finalWidth = (canvasWidth * 0.264583) * scale;
      const finalHeight = (canvasHeight * 0.264583) * scale;
      
      const x = (a4Width - finalWidth) / 2;
      const y = marginY;

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');

      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF from element:', error);
      throw new Error('Failed to generate PDF from element. Please try again.');
    }
  }, []);

  return { 
    generatePdf, 
    generatePdfFromElement 
  };
}; 