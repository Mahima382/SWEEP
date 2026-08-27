/**
 * Fraud rule engine (FR-11 §3). Pure, database-agnostic rule definitions. Each
 * rule inspects a provided context and returns a flag descriptor when triggered.
 * Keeping rules here (separate from the model) lets the team extend detection
 * without touching storage, and lets tests exercise rules without a database.
 */

/**
 * @typedef {object} Rule
 * @property {string} id - Stable rule identifier.
 * @property {string} description - Human-readable description.
 * @property {Function} evaluate - (ctx) => null | { severity, details }.
 */

/** Weight variance: actual vs expected collection weight diverge beyond threshold. */
const weightVariance = {
  id: 'weight_variance',
  description: 'Actual collected weight diverges from expected weight beyond threshold.',
  evaluate(ctx) {
    const { expectedWeight, actualWeight, thresholdPct = 20 } = ctx || {};
    if (expectedWeight == null || actualWeight == null || expectedWeight <= 0) {
      return null;
    }
    const variancePct = (Math.abs(actualWeight - expectedWeight) / expectedWeight) * 100;
    if (variancePct > thresholdPct) {
      return {
        severity: variancePct >= 50 ? 'high' : 'medium',
        details: `Weight variance ${variancePct.toFixed(1)}% exceeds threshold ${thresholdPct}%`,
      };
    }
    return null;
  },
};

/** Rapid account creation: a brand-new account acting suspiciously. */
const rapidAccountCreation = {
  id: 'rapid_account_creation',
  description: 'Account created very recently (possible burner/fraud account).',
  evaluate(ctx) {
    const { accountAgeHours } = ctx || {};
    if (accountAgeHours == null) { return null; }
    if (accountAgeHours < 24) {
      return {
        severity: 'high',
        details: `Account age ${accountAgeHours}h below 24h threshold`,
      };
    }
    return null;
  },
};

/** Suspicious activity: signal list or keyword hit in supplied context. */
const suspiciousActivity = {
  id: 'suspicious_activity',
  description: 'Context contains a known suspicious signal.',
  evaluate(ctx) {
    const { signals } = ctx || {};
    if (Array.isArray(signals) && signals.length > 0) {
      return {
        severity: 'low',
        details: `Suspicious signals: ${signals.join(', ')}`,
      };
    }
    return null;
  },
};

const RULES = [weightVariance, rapidAccountCreation, suspiciousActivity];

/**
 * Returns the registry of available rules (id + description).
 *
 * @returns {Array<{id:string, description:string}>} Rule metadata.
 */
function listRules() {
  return RULES.map((r) => ({ id: r.id, description: r.description }));
}

/**
 * Runs a single rule by id against a context.
 *
 * @param {string} ruleId - Rule id.
 * @param {object} ctx - Context object passed to the rule.
 * @returns {object|null} Flag descriptor if triggered, else null.
 */
function evaluateRule(ruleId, ctx) {
  const rule = RULES.find((r) => r.id === ruleId);
  if (!rule) { return null; }
  return rule.evaluate(ctx);
}

/**
 * Runs every registered rule against a context.
 *
 * @param {object} ctx - Shared context for all rules.
 * @returns {Array<{rule:string, severity:string, details:string}>} Triggered flags.
 */
function runAllRules(ctx) {
  return RULES
    .map((r) => ({ rule: r.id, result: r.evaluate(ctx) }))
    .filter((x) => x.result)
    .map((x) => ({ rule: x.rule, severity: x.result.severity, details: x.result.details }));
}

module.exports = { listRules, evaluateRule, runAllRules };
