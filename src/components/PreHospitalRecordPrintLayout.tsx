import React from 'react';
import { BodyMap } from './BodyMap';

interface VitalSigns {
  id: string;
  hora: string;
  ta: string;    // Tensión Arterial
  fc: string;    // Frecuencia Cardíaca
  fr: string;    // Frecuencia Respiratoria
  temp: string;  // Temperatura
  satO2: string; // Saturación de Oxígeno
  uc: string;    // Nivel de Conciencia
  glu: string;   // Glucosa
  glasgow: string; // Escala de Glasgow
}

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
  signosVitales?: VitalSigns[];
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

interface PreHospitalRecordPrintLayoutProps {
  record: PreHospitalRecord;
}

export const PreHospitalRecordPrintLayout: React.FC<PreHospitalRecordPrintLayoutProps> = ({ record }) => {
  const displayValue = (value: any, fallback: string = "") => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : fallback;
    }
    return value || fallback;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="frap-layout print-layout">
      
      {/* Header - Logo y Título */}
      <div className="frap-header print-header print-section">
        <div className="frap-flex print-flex frap-items-center print-items-center frap-justify-between print-justify-between frap-p-2 print-p-2">
          <div className="frap-w-16 print-w-16 frap-h-16 print-h-16 border border-gray-400 print-border frap-flex print-flex frap-items-center print-items-center frap-justify-center print-justify-center frap-text-xs print-text-xs">
            LOGO
          </div>
          <div className="frap-flex-1 print-flex-1 frap-text-center print-text-center">
            <h1 className="frap-text-sm print-text-sm frap-font-bold print-font-bold frap-uppercase print-uppercase frap-tracking-wide print-tracking-wide">
              FORMATO DE REGISTRO DE TRASLADO Y ATENCIÓN PREHOSPITALARIA
            </h1>
            <p className="frap-text-xs print-text-xs frap-mt-2 print-mt-2">FRAP</p>
          </div>
          <div className="frap-w-16 print-w-16 frap-h-16 print-h-16 border border-gray-400 print-border frap-flex print-flex frap-items-center print-items-center frap-justify-center print-justify-center frap-text-xs print-text-xs">
            QR
          </div>
        </div>
      </div>

      {/* Sección 1: Datos del Registro */}
      <div className="frap-section print-border print-section frap-mb-1 print-mb-1">
        <div className="frap-section-header print-bg-gray print-border-bottom">
          <h2 className="frap-font-bold print-font-bold frap-text-xs print-text-xs">1. DATOS DEL REGISTRO</h2>
        </div>
        <div className="frap-content print-p-2">
          <div className="frap-grid-12 print-grid-12 frap-text-xs print-text-xs">
            <div className="frap-col-span-3 print-col-span-3">
              <label className="frap-font-semibold print-font-semibold">CONVENIO:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.convenio)}
              </div>
            </div>
            <div className="frap-col-span-3 print-col-span-3">
              <label className="frap-font-semibold print-font-semibold">EPISODIO:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.episodio)}
              </div>
            </div>
            <div className="frap-col-span-3 print-col-span-3">
              <label className="frap-font-semibold print-font-semibold">FOLIO:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.folio)}
              </div>
            </div>
            <div className="frap-col-span-3 print-col-span-3">
              <label className="frap-font-semibold print-font-semibold">FECHA:</label>
              <div className="frap-underline print-underline">
                {formatDate(record.fecha)}
              </div>
            </div>
          </div>
          <div className="frap-mt-2 print-mt-2">
            <label className="frap-font-semibold print-font-semibold frap-text-xs print-text-xs">SOLICITADO POR:</label>
            <div className="frap-underline print-underline">
              {displayValue(record.solicitadoPor)}
            </div>
          </div>
        </div>
      </div>

      {/* Sección 2: Datos del Paciente */}
      <div className="frap-section print-border print-section frap-mb-1 print-mb-1">
        <div className="frap-section-header print-bg-gray print-border-bottom">
          <h2 className="frap-font-bold print-font-bold frap-text-xs print-text-xs">2. DATOS DEL PACIENTE</h2>
        </div>
        <div className="frap-content print-p-2">
          <div className="frap-grid-12 print-grid-12 frap-text-xs print-text-xs frap-mb-2 print-mb-2">
            <div className="frap-col-span-6 print-col-span-6">
              <label className="frap-font-semibold print-font-semibold">NOMBRE:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.patientName)}
              </div>
            </div>
            <div className="frap-col-span-2 print-col-span-2">
              <label className="frap-font-semibold print-font-semibold">EDAD:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.patient?.age)}
              </div>
            </div>
            <div className="frap-col-span-2 print-col-span-2">
              <label className="frap-font-semibold print-font-semibold">SEXO:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.patient?.sex)}
              </div>
            </div>
            <div className="frap-col-span-2 print-col-span-2">
              <label className="frap-font-semibold print-font-semibold">TELÉFONO:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.patient?.phone)}
              </div>
            </div>
          </div>
          <div className="frap-grid-2 print-grid-2 frap-text-xs print-text-xs">
            <div>
              <label className="frap-font-semibold print-font-semibold">DIRECCIÓN:</label>
              <div className="frap-underline print-underline">
                {`${displayValue(record.patient?.street)} ${displayValue(record.patient?.exteriorNumber)} ${displayValue(record.patient?.interiorNumber)} ${displayValue(record.patient?.neighborhood)} ${displayValue(record.patient?.city)}`.trim()}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">DERECHOHABIENCIA:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.patient?.insurance)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 3: Datos de Captación */}
      <div className="frap-section print-border print-section frap-mb-1 print-mb-1">
        <div className="frap-section-header print-bg-gray print-border-bottom">
          <h2 className="frap-font-bold print-font-bold frap-text-xs print-text-xs">3. DATOS DE CAPTACIÓN</h2>
        </div>
        <div className="frap-content print-p-2">
          <div className="frap-grid-8 print-grid-8 frap-text-xs print-text-xs frap-mb-2 print-mb-2">
            <div className="frap-col-span-2 print-col-span-2">
              <label className="frap-font-semibold print-font-semibold">HORA LLEGADA:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.horaLlegada)}
              </div>
            </div>
            <div className="frap-col-span-2 print-col-span-2">
              <label className="frap-font-semibold print-font-semibold">HORA ARRIBO:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.horaArribo)}
              </div>
            </div>
            <div className="frap-col-span-2 print-col-span-2">
              <label className="frap-font-semibold print-font-semibold">TIEMPO ESPERA:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.tiempoEspera)}
              </div>
            </div>
            <div className="frap-col-span-2 print-col-span-2">
              <label className="frap-font-semibold print-font-semibold">HORA TÉRMINO:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.horaTermino)}
              </div>
            </div>
          </div>
          <div className="frap-grid-2 print-grid-2 frap-text-xs print-text-xs">
            <div>
              <label className="frap-font-semibold print-font-semibold">UBICACIÓN:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.ubicacion)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">TIPO DE SERVICIO:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.tipoServicio)} {displayValue(record.otroTipoServicio)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 4: Antecedentes Patológicos */}
      <div className="frap-section print-border print-section frap-mb-1 print-mb-1">
        <div className="frap-section-header print-bg-gray print-border-bottom">
          <h2 className="frap-font-bold print-font-bold frap-text-xs print-text-xs">4. ANTECEDENTES PATOLÓGICOS</h2>
        </div>
        <div className="frap-content print-p-2">
          <div className="frap-grid-6 print-grid-6 frap-text-xs print-text-xs">
            {[
              'DIABETES', 'HIPERTENSIÓN', 'CARDIOPATÍA', 'ALERGIAS', 
              'EPILEPSIA', 'OTROS'
            ].map((antecedente) => (
              <div key={antecedente} className="frap-flex print-flex frap-items-center print-items-center frap-gap-1 print-gap-1">
                <div className="frap-checkbox print-checkbox">
                  {record.antecedentesPatologicos?.includes(antecedente.toLowerCase()) ? '✓' : ''}
                </div>
                <span>{antecedente}</span>
              </div>
            ))}
          </div>
          {record.otraPatologia && (
            <div className="frap-mt-2 print-mt-2 frap-text-xs print-text-xs">
              <label className="frap-font-semibold print-font-semibold">ESPECIFICAR:</label>
              <div className="frap-underline print-underline">
                {record.otraPatologia}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sección 5: Antecedentes Clínicos */}
      <div className="frap-section print-border print-section frap-mb-1 print-mb-1">
        <div className="frap-section-header print-bg-gray print-border-bottom">
          <h2 className="frap-font-bold print-font-bold frap-text-xs print-text-xs">5. ANTECEDENTES CLÍNICOS</h2>
        </div>
        <div className="frap-content print-p-2">
          <div className="frap-grid-2 print-grid-2 frap-text-xs print-text-xs">
            <div>
              <label className="frap-font-semibold print-font-semibold">TIPO:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.tipoAntecedente)} {displayValue(record.otroTipoAntecedente)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">AGENTE CASUAL:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.agenteCasual)}
              </div>
            </div>
          </div>
          <div className="frap-grid-2 print-grid-2 frap-text-xs print-text-xs frap-mt-2 print-mt-2">
            <div>
              <label className="frap-font-semibold print-font-semibold">CINEMÁTICA:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.cinematica)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">MEDIDA DE SEGURIDAD:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.medidaSeguridad)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 6: Localización de Lesiones */}
      <div className="frap-section print-border print-section frap-mb-1 print-mb-1">
        <div className="frap-section-header print-bg-gray print-border-bottom">
          <h2 className="frap-font-bold print-font-bold frap-text-xs print-text-xs">6. LOCALIZACIÓN DE LESIONES</h2>
        </div>
        <div className="frap-content print-p-2">
          <div className="frap-flex print-flex frap-justify-center print-justify-center">
            <div className="frap-text-center print-text-center">
              <p className="frap-text-xs print-text-xs frap-font-semibold print-font-semibold frap-mb-2 print-mb-2">Haga clic en el cuerpo para marcar lesiones</p>
              <div className="frap-body-map print-body-map">
                <BodyMap
                  lesions={record.lesiones || []}
                  side="front"
                  showSwitch={false}
                />
              </div>
            </div>
          </div>
          <div className="frap-mt-2 print-mt-2">
            <div className="frap-grid-5 print-grid-5 frap-text-xs print-text-xs">
              <div>1. HEMORRAGIA</div>
              <div>2. HERIDA</div>
              <div>3. CONTUSIÓN</div>
              <div>4. FRACTURA</div>
              <div>5. LUXACIÓN/ESGUINCE</div>
              <div>6. OBJETO EXTRAÑO</div>
              <div>7. QUEMADURA</div>
              <div>8. PICADURA/MORDEDURA</div>
              <div>9. EDEMA/HEMATOMA</div>
              <div>10. OTRO</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 7: Exploración Física (Signos Vitales) */}
      <div className="frap-section print-border print-section frap-mb-1 print-mb-1">
        <div className="frap-section-header print-bg-gray print-border-bottom">
          <h2 className="frap-font-bold print-font-bold frap-text-xs print-text-xs">7. EXPLORACIÓN FÍSICA - SIGNOS VITALES</h2>
        </div>
        <div className="frap-content print-p-2">
          {record.signosVitales && record.signosVitales.length > 0 ? (
            <div className="frap-vital-signs-table print-vital-signs-table">
              <table className="frap-w-full print-w-full frap-border-collapse print-border-collapse">
                <thead>
                  <tr className="frap-bg-gray-100 print-bg-gray-100">
                    <th className="frap-border print-border frap-text-xs print-text-xs frap-font-semibold print-font-semibold frap-p-1 print-p-1">Parámetro</th>
                    {record.signosVitales.map((vs, index) => (
                      <th key={vs.id} className="frap-border print-border frap-text-xs print-text-xs frap-font-semibold print-font-semibold frap-p-1 print-p-1">
                        Registro {index + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="frap-bg-blue-50 print-bg-blue-50">
                    <td className="frap-border print-border frap-text-xs print-text-xs frap-font-semibold print-font-semibold frap-p-1 print-p-1">Hora</td>
                    {record.signosVitales.map((vs) => (
                      <td key={vs.id} className="frap-border print-border frap-text-xs print-text-xs frap-p-1 print-p-1 frap-text-center print-text-center">
                        {vs.hora}
                      </td>
                    ))}
                  </tr>
                  {[
                    { field: 'ta', label: 'T.A. (mmHg)' },
                    { field: 'fc', label: 'F.C. (lpm)' },
                    { field: 'fr', label: 'F.R. (rpm)' },
                    { field: 'temp', label: 'Temp. (°C)' },
                    { field: 'satO2', label: 'SpO2 (%)' },
                    { field: 'uc', label: 'N.C.' },
                    { field: 'glu', label: 'Glucosa (mg/dL)' },
                    { field: 'glasgow', label: 'Glasgow' }
                  ].map((param) => (
                    <tr key={param.field}>
                      <td className="frap-border print-border frap-text-xs print-text-xs frap-font-semibold print-font-semibold frap-p-1 print-p-1">
                        {param.label}
                      </td>
                      {record.signosVitales?.map((vs) => (
                        <td key={vs.id} className="frap-border print-border frap-text-xs print-text-xs frap-p-1 print-p-1 frap-text-center print-text-center">
                          {(vs as any)[param.field]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="frap-text-center print-text-center frap-text-xs print-text-xs frap-text-gray-500 print-text-gray-500">
              No se registraron signos vitales durante el traslado
            </div>
          )}
        </div>
      </div>

      {/* Sección 8: Manejo */}
      <div className="frap-section print-border print-section frap-mb-1 print-mb-1">
        <div className="frap-section-header print-bg-gray print-border-bottom">
          <h2 className="frap-font-bold print-font-bold frap-text-xs print-text-xs">8. MANEJO</h2>
        </div>
        <div className="frap-content print-p-2">
          <div className="frap-grid-5 print-grid-5 frap-text-xs print-text-xs frap-mb-2 print-mb-2">
            {[
              { key: 'viaAerea', label: 'VÍA AÉREA' },
              { key: 'canalizacion', label: 'CANALIZACIÓN' },
              { key: 'empaquetamiento', label: 'EMPAQUETAMIENTO' },
              { key: 'inmovilizacion', label: 'INMOVILIZACIÓN' },
              { key: 'monitor', label: 'MONITOR' },
              { key: 'rcpBasica', label: 'RCP BÁSICA' },
              { key: 'mastPna', label: 'MAST O PNA' },
              { key: 'collarinCervical', label: 'COLLARÍN CERVICAL' },
              { key: 'desfibrilacion', label: 'DESFIBRILACIÓN' },
              { key: 'apoyoVent', label: 'APOYO VENT.' }
            ].map((item) => (
              <div key={item.key} className="frap-flex print-flex frap-items-center print-items-center frap-gap-1 print-gap-1">
                <div className="frap-checkbox print-checkbox">
                  {(record as any)[item.key] ? '✓' : ''}
                </div>
                <span className="frap-text-xs print-text-xs">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="frap-grid-2 print-grid-2 frap-text-xs print-text-xs">
            <div>
              <label className="frap-font-semibold print-font-semibold">OXÍGENO (L/min):</label>
              <div className="frap-underline print-underline">
                {displayValue(record.oxigeno)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">OTRO:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.otroManejo)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 9: Medicamentos */}
      <div className="frap-section print-border print-section frap-mb-1 print-mb-1">
        <div className="frap-section-header print-bg-gray print-border-bottom">
          <h2 className="frap-font-bold print-font-bold frap-text-xs print-text-xs">9. MEDICAMENTOS</h2>
        </div>
        <div className="frap-content print-p-2">
          <div className="frap-underline print-underline" style={{ minHeight: '10mm', fontSize: '8px' }}>
            {displayValue(record.medicamentos)}
          </div>
        </div>
      </div>

      {/* Sección 10: Urgencias Gineco-obstétricas */}
      <div className="frap-section print-border print-section frap-mb-1 print-mb-1">
        <div className="frap-section-header print-bg-gray print-border-bottom">
          <h2 className="frap-font-bold print-font-bold frap-text-xs print-text-xs">10. URGENCIAS GINECO-OBSTÉTRICAS</h2>
        </div>
        <div className="frap-content print-p-2">
          <div className="frap-grid-3 print-grid-3 frap-text-xs print-text-xs frap-mb-2 print-mb-2">
            <div className="frap-flex print-flex frap-items-center print-items-center frap-gap-1 print-gap-1">
              <div className="frap-checkbox print-checkbox">
                {record.parto ? '✓' : ''}
              </div>
              <span>PARTO</span>
            </div>
            <div className="frap-flex print-flex frap-items-center print-items-center frap-gap-1 print-gap-1">
              <div className="frap-checkbox print-checkbox">
                {record.aborto ? '✓' : ''}
              </div>
              <span>ABORTO</span>
            </div>
            <div className="frap-flex print-flex frap-items-center print-items-center frap-gap-1 print-gap-1">
              <div className="frap-checkbox print-checkbox">
                {record.hxVaginal ? '✓' : ''}
              </div>
              <span>HX. VAGINAL</span>
            </div>
          </div>
          <div className="frap-grid-4 print-grid-4 frap-text-xs print-text-xs">
            <div>
              <label className="frap-font-semibold print-font-semibold">F.U.M.:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.fechaUltimaMenstruacion)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">S.D.G.:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.semanasGestacion)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">R.C.F.:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.ruidosCardiacosFetales)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">GESTA:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.gesta)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 11: Justificación de Prioridad */}
      <div className="frap-section print-border print-section frap-mb-1 print-mb-1">
        <div className="frap-section-header print-bg-gray print-border-bottom">
          <h2 className="frap-font-bold print-font-bold frap-text-xs print-text-xs">11. JUSTIFICACIÓN DE PRIORIDAD</h2>
        </div>
        <div className="frap-content print-p-2">
          <div className="frap-grid-4 print-grid-4 frap-text-xs print-text-xs frap-mb-2 print-mb-2">
            {['ROJO', 'AMARILLO', 'VERDE', 'NEGRO'].map((color) => (
              <div key={color} className="frap-flex print-flex frap-items-center print-items-center frap-gap-1 print-gap-1">
                <div className="frap-checkbox print-checkbox">
                  {record.prioridad?.toLowerCase() === color.toLowerCase() ? '✓' : ''}
                </div>
                <span>{color}</span>
              </div>
            ))}
          </div>
          <div className="frap-grid-4 print-grid-4 frap-text-xs print-text-xs">
            <div>
              <label className="frap-font-semibold print-font-semibold">PUPILAS:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.pupilas)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">COLOR PIEL:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.colorPiel)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">PIEL:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.piel)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">TEMPERATURA:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.temperatura)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 12: Unidad Médica que Recibe */}
      <div className="frap-section print-border print-section frap-mb-1 print-mb-1">
        <div className="frap-section-header print-bg-gray print-border-bottom">
          <h2 className="frap-font-bold print-font-bold frap-text-xs print-text-xs">12. UNIDAD MÉDICA QUE RECIBE</h2>
        </div>
        <div className="frap-content print-p-2">
          <div className="frap-grid-3 print-grid-3 frap-text-xs print-text-xs frap-mb-2 print-mb-2">
            <div>
              <label className="frap-font-semibold print-font-semibold">LUGAR ORIGEN:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.lugarOrigen)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">LUGAR CONSULTA:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.lugarConsulta)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">LUGAR DESTINO:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.lugarDestino)}
              </div>
            </div>
          </div>
          <div className="frap-grid-4 print-grid-4 frap-text-xs print-text-xs">
            <div>
              <label className="frap-font-semibold print-font-semibold">AMBULANCIA No.:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.ambulanciaNumero)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">PLACAS:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.ambulanciaPlacas)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">PERSONAL:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.personal)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">DOCTOR:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.doctor)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 13: Médico Receptor */}
      <div className="frap-section print-border print-section frap-mb-1 print-mb-1">
        <div className="frap-section-header print-bg-gray print-border-bottom">
          <h2 className="frap-font-bold print-font-bold frap-text-xs print-text-xs">13. MÉDICO RECEPTOR</h2>
        </div>
        <div className="frap-content print-p-2">
          <div className="frap-grid-3 print-grid-3 frap-text-xs print-text-xs">
            <div>
              <label className="frap-font-semibold print-font-semibold">NOMBRE:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.medicoReceptorNombre)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">HORA ENTREGA:</label>
              <div className="frap-underline print-underline">
                {displayValue(record.horaEntrega)}
              </div>
            </div>
            <div>
              <label className="frap-font-semibold print-font-semibold">FIRMA:</label>
              <div className="frap-signature-box print-signature-box">
                {record.medicoReceptorFirma ? (
                  <img 
                    src={record.medicoReceptorFirma} 
                    alt="Firma médico" 
                    className="frap-max-h-10 print-max-h-10 frap-max-w-full print-max-w-full frap-object-contain print-object-contain"
                  />
                ) : (
                  <span className="frap-text-gray-400 print-text-gray-400 frap-text-xs print-text-xs">Firma</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="frap-section print-border">
        <div className="frap-p-2 print-p-2 frap-text-xs print-text-xs frap-text-center print-text-center">
          <p>FORMATO DE REGISTRO DE TRASLADO Y ATENCIÓN PREHOSPITALARIA - FRAP</p>
          <p className="frap-text-xs print-text-xs frap-text-gray-600 print-text-gray-600 frap-mt-2 print-mt-2">
            Generado el {new Date().toLocaleDateString('es-ES')} - ID: {record.id}
          </p>
        </div>
      </div>
    </div>
  );
}; 