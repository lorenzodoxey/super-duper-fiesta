/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { suggestOptimalTime } from './geocoding';

describe('suggestOptimalTime', () => {
  const makeDate = (h: number, m: number) => {
    const d = new Date('2026-01-17T00:00:00');
    d.setHours(h, m, 0, 0);
    return d;
  };

  it('returns 09:00 when no appointments', () => {
    expect(suggestOptimalTime([], new Date('2026-01-17'))).toBe('09:00');
  });

  it('suggests gap before first meeting', () => {
    const appts = [{ date: makeDate(0, 0), time: '10:00', duration: 30 }];
    expect(suggestOptimalTime(appts, new Date('2026-01-17'))).toBe('09:00');
  });

  it('picks gap between meetings respecting duration', () => {
    const appts = [
      { date: makeDate(0, 0), time: '09:00', duration: 30 },
      { date: makeDate(0, 0), time: '10:00', duration: 60 },
    ];
    // Gap 09:30-10:00 is 30 mins => pick 09:30 after snapping
    expect(suggestOptimalTime(appts, new Date('2026-01-17'))).toBe('09:30');
  });

  it('picks after last meeting within workday', () => {
    const appts = [
      { date: makeDate(0, 0), time: '15:00', duration: 60 },
    ];
    expect(suggestOptimalTime(appts, new Date('2026-01-17'))).toBe('16:00');
  });

  it('falls back to 09:00 if fully booked', () => {
    const appts = [
      { date: makeDate(0, 0), time: '09:00', duration: 240 },
      { date: makeDate(0, 0), time: '13:00', duration: 240 },
    ];
    // No room 09-17 for 30m
    expect(suggestOptimalTime(appts, new Date('2026-01-17'), 60)).toBe('09:00');
  });
});
