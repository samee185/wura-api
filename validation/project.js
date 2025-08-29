const Joi = require("joi");

const projectValidationSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  objectives: Joi.string().required(),
  date: Joi.date().required(),
  status: Joi.string().valid("pending", "active", "completed").optional(),
});

module.exports = { projectValidationSchema };
