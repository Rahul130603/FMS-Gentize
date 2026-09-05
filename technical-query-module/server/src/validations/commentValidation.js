const Joi = require('joi');

const addCommentSchema = Joi.object({
  comment: Joi.string().min(1).max(4000).required(),
  isInternal: Joi.boolean().default(false),
});

module.exports = { addCommentSchema };
