import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', false && 'hidden', true && 'visible');
    expect(result).toBe('base-class visible');
  });

  it('should handle undefined and null', () => {
    const result = cn('base', undefined, null, 'extra');
    expect(result).toBe('base extra');
  });
});
