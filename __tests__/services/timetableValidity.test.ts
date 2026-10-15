import { timetableNoticeText, TIMETABLE_WARN_DAYS } from '../../src/features/home/components/TimetableNotice';
import { timetableDaysLeft, timetableLastServiceDay } from '../../src/services/repositories/gtfs/validity';

const calendar = {
  services: [
    [[1, 1, 1, 1, 1, 0, 0], 20261001, 20261231],
    [[0, 0, 0, 0, 0, 1, 1], 20261001, 20261130],
  ] as [number[], number, number][],
  exceptions: { '20270102': { add: [0], remove: [] }, '20270105': { add: [], remove: [0] } },
};

describe('offline timetable validity', () => {
  it('reads the last service day from the bundled feed', () => {
    const last = timetableLastServiceDay();
    expect(last).not.toBeNull();
    expect(String(last)).toMatch(/^\d{8}$/);
  });

  it('extends validity with added exception days, not removed ones', () => {
    expect(timetableLastServiceDay(calendar)).toBe(20270102);
  });

  it('counts whole days left including today', () => {
    expect(timetableDaysLeft(new Date(2027, 0, 2, 18).getTime(), calendar)).toBe(1);
    expect(timetableDaysLeft(new Date(2026, 11, 31, 8).getTime(), calendar)).toBe(3);
    expect(timetableDaysLeft(new Date(2027, 0, 3, 8).getTime(), calendar)).toBe(0);
  });

  it('warns only inside the warning window and says when it expired', () => {
    expect(timetableNoticeText(null)).toBeNull();
    expect(timetableNoticeText(TIMETABLE_WARN_DAYS + 1)).toBeNull();
    expect(timetableNoticeText(5)).toContain('5');
    expect(timetableNoticeText(1)).toContain('azi');
    expect(timetableNoticeText(0)).toContain('expirat');
    expect(timetableNoticeText(-30)).toContain('expirat');
  });
});
