const ApiError = require('../utils/apiError');

/**
 * Generic Joi-schema validator middleware factory.
 * validate({ body: schema, query: schema, params: schema })
 */
function validate(schemas) {
  return (req, res, next) => {
    for (const key of ['params', 'query', 'body']) {
      const schema = schemas[key];
      if (!schema) continue;
      const { error, value } = schema.validate(req[key], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });
      if (error) {
        const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
        return next(ApiError.badRequest('Validation failed', details));
      }
      req[key] = value;
    }
    return next();
  };
}

module.exports = validate;
