/**
 * Wraps an async Express route/middleware so rejected promises are
 * forwarded to next(err) instead of crashing the process or hanging
 * the request.
 */
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
