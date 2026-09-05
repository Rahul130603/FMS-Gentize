/* Minimal dependency-free structured logger. Swap for the host FMS's own
 * logger (winston/pino) by re-exporting it from this file if one exists. */
const level = (msg) => new Date().toISOString() + ' ' + msg;

module.exports = {
  info: (...args) => console.log(level('[INFO]'), ...args),
  warn: (...args) => console.warn(level('[WARN]'), ...args),
  error: (...args) => console.error(level('[ERROR]'), ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') console.debug(level('[DEBUG]'), ...args);
  },
};
