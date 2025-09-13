const Joi = require('joi');

const eventValidationSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  eventDate: Joi.date().required(),
  eventTime: Joi.string().required(),
  venue: Joi.string().required(),
  aboutEvent: Joi.string(),
  objectives: Joi.array().items(Joi.string()),
  speakers: Joi.array().items(Joi.string()),
  host: Joi.string().required(),  
});

module.exports = { eventValidationSchema };
