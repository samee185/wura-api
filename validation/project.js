const Joi = require("joi");

const projectValidationSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(4).required(),
  objectives: Joi.array().items(Joi.string().min(1)),
  date: Joi.date(),
  status: Joi.string().optional(),
});

module.exports = { projectValidationSchema };
