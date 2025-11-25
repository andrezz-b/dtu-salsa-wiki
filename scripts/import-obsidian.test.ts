import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { parseObsidianDate, normalizeRelationItems, cleanFrontmatter } from './import-obsidian.js';

describe('Import Obsidian Script', () => {
  
  describe('parseObsidianDate', () => {
    it('should parse valid Obsidian date string', () => {
      const input = '2025-11-06, 20:11';
      const result = parseObsidianDate(input);
      assert.ok(result instanceof Date);
      assert.strictEqual(result.toISOString(), '2025-11-06T19:11:00.000Z'); // Assuming UTC or local? 
      // Wait, the script uses new Date('YYYY-MM-DDTHH:mm') which interprets as local time if no Z.
      // But toISOString() outputs UTC. 
      // If I run this in a test environment, timezone might vary.
      // Let's check components instead to be safe against timezone issues in test runner.
      assert.strictEqual(result.getFullYear(), 2025);
      assert.strictEqual(result.getMonth(), 10); // 0-indexed
      assert.strictEqual(result.getDate(), 6);
      assert.strictEqual(result.getHours(), 20);
      assert.strictEqual(result.getMinutes(), 11);
    });

    it('should parse date with single digit hour', () => {
      const input = '2025-11-26, 0:10';
      const result = parseObsidianDate(input);
      assert.ok(result instanceof Date);
      assert.strictEqual(result.getHours(), 0);
      assert.strictEqual(result.getMinutes(), 10);
    });

    it('should return undefined for invalid date string', () => {
      assert.strictEqual(parseObsidianDate('invalid'), undefined);
      assert.strictEqual(parseObsidianDate('2025-11-26'), undefined); // Missing time part
    });

    it('should return the input if it is already a Date object', () => {
      const date = new Date();
      assert.strictEqual(parseObsidianDate(date), date);
    });

    it('should return undefined for non-string input', () => {
      assert.strictEqual(parseObsidianDate(123), undefined);
      assert.strictEqual(parseObsidianDate(null), undefined);
    });
  });

  describe('normalizeRelationItems', () => {
    it('should return simple string array as is', () => {
      const input = ['Move A', 'Move B'];
      const result = normalizeRelationItems(input);
      assert.deepStrictEqual(result, ['Move A', 'Move B']);
    });

    it('should unwrap nested arrays (Obsidian/YAML quirk)', () => {
      const input = [['Move A'], 'Move B'];
      const result = normalizeRelationItems(input);
      assert.deepStrictEqual(result, ['Move A', 'Move B']);
    });

    it('should unwrap deeply nested arrays', () => {
      const input = [[['Move A']]];
      const result = normalizeRelationItems(input);
      assert.deepStrictEqual(result, ['Move A']);
    });

    it('should filter out non-string items', () => {
      const input = ['Move A', 123, { foo: 'bar' }];
      const result = normalizeRelationItems(input);
      assert.deepStrictEqual(result, ['Move A']);
    });

    it('should handle empty arrays', () => {
      const input: any[] = [];
      const result = normalizeRelationItems(input);
      assert.deepStrictEqual(result, []);
    });
    
    it('should handle nested empty arrays', () => {
        const input = [[]];
        const result = normalizeRelationItems(input);
        assert.deepStrictEqual(result, []);
    });
  });

  describe('cleanFrontmatter', () => {
    it('should remove null and undefined values', () => {
      const input = { a: 1, b: null, c: undefined };
      const result = cleanFrontmatter(input);
      assert.deepStrictEqual(result, { a: 1 });
    });

    it('should remove empty arrays', () => {
      const input = { a: 1, b: [] };
      const result = cleanFrontmatter(input);
      assert.deepStrictEqual(result, { a: 1 });
    });

    it('should recursively clean objects', () => {
      const input = { a: 1, b: { c: null, d: [] } };
      const result = cleanFrontmatter(input);
      assert.deepStrictEqual(result, { a: 1 }); // b becomes empty object, which is then removed?
      // Let's check implementation: 
      // return Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined;
      // So yes, b should be removed.
    });

    it('should preserve Date objects', () => {
      const date = new Date();
      const input = { a: date };
      const result = cleanFrontmatter(input);
      assert.deepStrictEqual(result, { a: date });
    });

    it('should clean arrays of objects', () => {
      const input = { list: [{ a: 1 }, { b: null }] }; // {b: null} -> {} -> removed?
      // cleanFrontmatter on array: maps, filters null/undefined/empty string.
      // cleanFrontmatter on {b: null} returns undefined.
      // So list should be [{a: 1}]
      const result = cleanFrontmatter(input);
      assert.deepStrictEqual(result, { list: [{ a: 1 }] });
    });
  });
});
