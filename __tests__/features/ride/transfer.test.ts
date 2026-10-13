import { useRideStore, type DetectedVehicle } from '../../../src/features/ride/rideStore';

const mockVehicleTrolley: DetectedVehicle = {
  line: '15',
  vehicleId: '3114',
  vehicleType: 'Troleibuz',
  station: 'Piața Mărăști',
  destination: 'T. Grozăvescu (Poșta Mare)',
};

const mockVehicleTram: DetectedVehicle = {
  line: '1',
  vehicleId: '102',
  vehicleType: 'Tramvai',
  station: 'Piața Mărăști',
  destination: 'Gara de Nord',
};

describe('Smart Free Transfer (Transbordare Gratuită STPT 60 min)', () => {
  beforeEach(() => {
    useRideStore.getState().resetAll();
  });

  it('keeps activeTicket valid when exiting first vehicle within 60 minutes', () => {
    const startMs = Date.now();
    useRideStore.getState().startTicket({
      ticketId: 'tkt-15',
      originalLine: '15',
      currentLine: '15',
      passengers: 1,
      startedAtMs: startMs,
      expiresAtMs: startMs + 60 * 60 * 1000,
      chargeId: 'ch-15',
      isTransfer: false,
      transfersCount: 0,
    });
    useRideStore.getState().setActiveRide({
      line: mockVehicleTrolley.line,
      vehicleId: mockVehicleTrolley.vehicleId,
      passengers: 1,
      amount: 3,
      station: mockVehicleTrolley.station,
      destination: mockVehicleTrolley.destination,
      startedAt: '12:00',
      chargeId: 'ch-15',
    });

    expect(useRideStore.getState().status).toBe('active');
    expect(useRideStore.getState().activeTicket).not.toBeNull();

    // Passenger exits Line 15 after 15 minutes
    const exitMs = startMs + 15 * 60 * 1000;
    useRideStore.getState().clearRide(exitMs);

    expect(useRideStore.getState().status).toBe('idle');
    expect(useRideStore.getState().activeRide).toBeNull();
    // Ticket remains valid in store
    expect(useRideStore.getState().activeTicket).not.toBeNull();
    expect(useRideStore.getState().activeTicket?.originalLine).toBe('15');
  });

  it('automatically applies free transfer with 0 Lei and updates remaining minutes', () => {
    const startMs = 1700000000000;
    useRideStore.getState().startTicket({
      ticketId: 'tkt-15',
      originalLine: '15',
      currentLine: '15',
      passengers: 2,
      startedAtMs: startMs,
      expiresAtMs: startMs + 60 * 60 * 1000,
      chargeId: 'ch-15',
      isTransfer: false,
      transfersCount: 0,
    });

    // Board tram line 1 after 35 minutes (25 min remaining)
    const transferMs = startMs + 35 * 60 * 1000;
    const remainingMin = useRideStore.getState().applyTransfer(mockVehicleTram, transferMs);

    expect(remainingMin).toBe(25);
    const ride = useRideStore.getState().activeRide;
    expect(ride).not.toBeNull();
    expect(ride?.line).toBe('1');
    expect(ride?.amount).toBe(0); // FREE transfer: 0 Lei
    expect(ride?.isTransfer).toBe(true);
    expect(ride?.originalLine).toBe('15');
    expect(ride?.passengers).toBe(2);

    const ticket = useRideStore.getState().activeTicket;
    expect(ticket?.currentLine).toBe('1');
    expect(ticket?.isTransfer).toBe(true);
    expect(ticket?.transfersCount).toBe(1);
  });

  it('expires ticket after 60 minutes and clears it on exit', () => {
    const startMs = 1700000000000;
    useRideStore.getState().startTicket({
      ticketId: 'tkt-15',
      originalLine: '15',
      currentLine: '15',
      passengers: 1,
      startedAtMs: startMs,
      expiresAtMs: startMs + 60 * 60 * 1000,
      chargeId: 'ch-15',
      isTransfer: false,
      transfersCount: 0,
    });

    // Exiting after 61 minutes
    const exitMs = startMs + 61 * 60 * 1000;
    useRideStore.getState().clearRide(exitMs);

    expect(useRideStore.getState().activeTicket).toBeNull();
  });
});