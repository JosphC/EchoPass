import { stepPresence, strongestPerVehicle, type PresenceMap } from '../../../src/features/detection/ble/presence';
import { parseVehicleId } from '../../../src/features/detection/ble/scanner';
import type { BlePoll } from '../../../src/features/detection/types';

const poll = (deviceId: string, rssi: number | null): BlePoll => ({ deviceId, rssi, atMs: 0 });

function run(windows: BlePoll[][]): { entered: string[]; left: string[]; presence: PresenceMap } {
  let presence: PresenceMap = {};
  const entered: string[] = [];
  const left: string[] = [];
  for (const w of windows) {
    const step = stepPresence(presence, w);
    presence = step.presence;
    entered.push(...step.entered);
    left.push(...step.left);
  }
  return { entered, left, presence };
}

describe('BLE presence detector', () => {
  it('keeps the strongest advertisement per vehicle in a poll window', () => {
    const best = strongestPerVehicle([poll('3114', -80), poll('3114', -62), poll('102', -90), poll('102', null)]);
    expect(best.get('3114')).toBe(-62);
    expect(best.get('102')).toBe(-90);
  });

  it('boards after consecutive strong polls, exactly once', () => {
    const strong = Array.from({ length: 6 }, () => [poll('3114', -58)]);
    expect(run(strong).entered).toEqual(['3114']);
  });

  it('ignores a single strong spike (a bus passing the stop)', () => {
    const result = run([[poll('3114', -55)], [], [], []]);
    expect(result.entered).toEqual([]);
  });

  it('alights only after the signal stays weak, then forgets the vehicle', () => {
    const board = Array.from({ length: 4 }, () => [poll('3114', -58)]);
    const gone = Array.from({ length: 12 }, () => [] as BlePoll[]);
    const result = run([...board, ...gone]);
    expect(result.entered).toEqual(['3114']);
    expect(result.left).toEqual(['3114']);
    expect(result.presence['3114']).toBeUndefined();
  });

  it('survives a short signal dip inside the vehicle (hysteresis)', () => {
    const board = Array.from({ length: 4 }, () => [poll('3114', -58)]);
    const result = run([...board, [], [poll('3114', -60)], [poll('3114', -58)]]);
    expect(result.left).toEqual([]);
    expect(result.entered).toEqual(['3114']);
  });

  it('parses the vehicle id from the advertised name and ignores foreign devices', () => {
    expect(parseVehicleId('EP-3114', 'EP-')).toBe('3114');
    expect(parseVehicleId('JBL Flip 5', 'EP-')).toBeNull();
    expect(parseVehicleId('EP-', 'EP-')).toBeNull();
    expect(parseVehicleId(null, 'EP-')).toBeNull();
  });
});
