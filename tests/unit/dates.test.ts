import { it, expect } from 'vitest';
import { formatDate } from '../../src/lib/dates';

it.each([
  ['2026-10-16', '16 October 2026'],
  ['2026-06-04', '4 June 2026'],
  ['2025', '2025'],
])('formatDate(%s) = %s', (input, expected) => expect(formatDate(input)).toBe(expected));
