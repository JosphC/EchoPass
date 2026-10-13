export interface TransitAlert {
  type: 'detour' | 'warning' | 'info';
  title: string;
  description: string;
}

export interface LineStationStop {
  id: string;
  name: string;
  durationMinFromPrev: number;
  connections: string[];
  scheduledTime?: string;
  alert?: TransitAlert;
}

export const LINE_13_STOPS: LineStationStop[] = [
  { id: '13-1', name: 'Piața Regina Maria', durationMinFromPrev: 0, connections: ['11', '18'], scheduledTime: '3:19 PM' },
  { id: '13-2', name: 'Piața Mărăști', durationMinFromPrev: 3, connections: ['11', '15', '17'], scheduledTime: '3:22 PM' },
  {
    id: '13-3',
    name: 'Timiș',
    durationMinFromPrev: 3,
    connections: ['M32'],
    scheduledTime: '3:25 PM',
    alert: {
      type: 'detour',
      title: 'Detour · +2 alerts',
      description: 'M32 Line Detour - Ana Ipătescu Construction Project · Due to work being completed on roadway...',
    },
  },
  { id: '13-4', name: 'Bd. Cetății (Cloșca)', durationMinFromPrev: 2, connections: ['4', '7'], scheduledTime: '3:27 PM' },
  { id: '13-5', name: 'Piața Avram Iancu', durationMinFromPrev: 2, connections: ['4'], scheduledTime: '3:29 PM' },
  { id: '13-6', name: 'Vuk Karadjici', durationMinFromPrev: 2, connections: [], scheduledTime: '3:31 PM' },
  { id: '13-7', name: 'Grigore Alexandrescu (Mehala)', durationMinFromPrev: 1, connections: ['44'], scheduledTime: '3:32 PM' },
  { id: '13-8', name: 'Piața de Gros', durationMinFromPrev: 1, connections: [], scheduledTime: '3:33 PM' },
  { id: '13-9', name: 'Pasaj C.F. Mehala', durationMinFromPrev: 2, connections: [], scheduledTime: '3:35 PM' },
];

export const LINE_15_STOPS: LineStationStop[] = [
  { id: '15-1', name: 'Piața Mărăști', durationMinFromPrev: 0, connections: ['11', '17', '18', 'E2'], scheduledTime: '3:10 PM' },
  { id: '15-2', name: 'Parcul Copiilor', durationMinFromPrev: 3, connections: ['E2', 'E7', 'M3'], scheduledTime: '3:13 PM' },
  { id: '15-3', name: 'Complexul Studențesc', durationMinFromPrev: 2, connections: ['16', 'E2', 'E3', '1'], scheduledTime: '3:15 PM' },
  { id: '15-4', name: 'Strada Cluj', durationMinFromPrev: 3, connections: ['16', 'E2', 'E3'], scheduledTime: '3:18 PM' },
  { id: '15-5', name: 'Spitalul Județean', durationMinFromPrev: 2, connections: ['1', '9', 'E2'], scheduledTime: '3:20 PM' },
  { id: '15-6', name: 'Casa Tineretului', durationMinFromPrev: 2, connections: ['16', 'E2', 'E3'], scheduledTime: '3:22 PM' },
  { id: '15-7', name: 'Sala C. Jude (Ripensia)', durationMinFromPrev: 2, connections: ['4', '8'], scheduledTime: '3:24 PM' },
  { id: '15-8', name: 'Calea Martirilor', durationMinFromPrev: 3, connections: ['E3', 'M3'], scheduledTime: '3:27 PM' },
  { id: '15-9', name: 'Girație Bulevardul Sudului', durationMinFromPrev: 3, connections: ['24', 'E2'], scheduledTime: '3:30 PM' },
];

export const LINE_1_STOPS: LineStationStop[] = [
  { id: '1-1', name: 'Gara de Nord', durationMinFromPrev: 0, connections: ['8', '9', '11', '14', '18'], scheduledTime: '3:05 PM' },
  { id: '1-2', name: 'Bd. Regele Carol I', durationMinFromPrev: 3, connections: ['2', '8', '9'], scheduledTime: '3:08 PM' },
  { id: '1-3', name: 'Piața A. Mocioni (Sinaia)', durationMinFromPrev: 2, connections: ['2', '8', '33'], scheduledTime: '3:10 PM' },
  { id: '1-4', name: 'Piața Sfânta Maria', durationMinFromPrev: 2, connections: ['2', '4', '7', '8'], scheduledTime: '3:12 PM' },
  { id: '1-5', name: 'Piața N. Bălcescu', durationMinFromPrev: 3, connections: ['4', '7', '8'], scheduledTime: '3:15 PM' },
  { id: '1-6', name: 'Complexul Studențesc', durationMinFromPrev: 4, connections: ['15', '16', 'E2'], scheduledTime: '3:19 PM' },
  { id: '1-7', name: 'Drubeta (Liviu Rebreanu)', durationMinFromPrev: 3, connections: ['7', '9'], scheduledTime: '3:22 PM' },
  { id: '1-8', name: 'Spitalul Județean', durationMinFromPrev: 3, connections: ['15', '9'], scheduledTime: '3:25 PM' },
  { id: '1-9', name: 'Piața Gh. Domășneanu (AEM)', durationMinFromPrev: 4, connections: ['9', '24'], scheduledTime: '3:29 PM' },
];

export function getLineStops(line: string): LineStationStop[] {
  if (line === '15') return LINE_15_STOPS;
  if (line === '1') return LINE_1_STOPS;
  return LINE_13_STOPS;
}
