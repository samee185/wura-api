const Joi = require('joi');

const eventValidationSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  venue: Joi.string().required(),
  aboutEvent: Joi.string().required(),
});

module.exports = { eventValidationSchema };
