import { describe, it, expect } from 'vitest';
import { periodize } from '../../src/lib/periodize';

describe('periodize', () => {
  it.each([
    ['Jacob', 'Iacob'],
    ['Historian', 'Hiſtorian'],
    ['University', 'Vniverſity'],
    ['Atlantic', 'Atlantick'],
    ['Atlantic,', 'Atlantick,'],
    ['and', '&'],
    ['its', 'its'],
    ['class', 'claſs'],
    ['transfer', 'transfer'],
    ['Saskatoon:', 'Saſkatoon:'],
    ['Student', 'Student'],
    ['2026', '2026'],
  ])('%s -> %s', (input, expected) => {
    expect(periodize(input)).toBe(expected);
  });
});
