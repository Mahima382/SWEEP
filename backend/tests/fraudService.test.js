/**
 * Unit tests for the fraud rule engine (FR-11 Â§3). Pure logic, no database.
 */

import { describe, it, expect } from 'vitest';
import { evaluateRule, runAllRules, listRules } from '../services/fraudService';

describe('fraudService rules', () => {
  it('lists three registered rules', () => {
    const rules = listRules();
    expect(rules).toHaveLength(3);
    expect(rules.map((r) => r.id)).toEqual(
      expect.arrayContaining(['weight_variance', 'rapid_account_creation', 'suspicious_activity']),
    );
  });

  it('weight_variance triggers when variance exceeds threshold', () => {
    const trig = evaluateRule('weight_variance', { expectedWeight: 100, actualWeight: 150 });
    expect(trig).not.toBeNull();
    expect(trig.severity).toBe('high');
  });

  it('weight_variance does not trigger within threshold', () => {
    const trig = evaluateRule('weight_variance', { expectedWeight: 100, actualWeight: 110 });
    expect(trig).toBeNull();
  });

  it('rapid_account_creation triggers for a fresh account', () => {
    const trig = evaluateRule('rapid_account_creation', { accountAgeHours: 10 });
    expect(trig).not.toBeNull();
    expect(trig.severity).toBe('high');
  });

  it('suspicious_activity triggers on supplied signals', () => {
    const trig = evaluateRule('suspicious_activity', { signals: ['chargeback'] });
    expect(trig).not.toBeNull();
    expect(trig.severity).toBe('low');
  });

  it('runAllRules returns every triggered flag', () => {
    const flags = runAllRules({ expectedWeight: 100, actualWeight: 200, accountAgeHours: 5 });
    const ids = flags.map((f) => f.rule);
    expect(ids).toEqual(expect.arrayContaining(['weight_variance', 'rapid_account_creation']));
  });
});
