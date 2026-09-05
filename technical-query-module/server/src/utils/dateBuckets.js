/**
 * Helpers for building equal-width time buckets (for trend charts) and
 * for computing a "previous period" window of identical length so
 * period-over-period comparisons are apples-to-apples.
 */
const UNIT_INTERVAL = {
  daily: '1 day',
  weekly: '1 week',
  monthly: '1 month',
  quarterly: '3 months',
  yearly: '1 year',
};

const DEFAULT_BUCKET_COUNT = {
  daily: 14,
  weekly: 12,
  monthly: 12,
  quarterly: 8,
  yearly: 5,
};

function resolvePeriod(period) {
  const key = UNIT_INTERVAL[period] ? period : 'monthly';
  return { unit: key, interval: UNIT_INTERVAL[key], defaultCount: DEFAULT_BUCKET_COUNT[key] };
}

module.exports = { resolvePeriod, UNIT_INTERVAL, DEFAULT_BUCKET_COUNT };
