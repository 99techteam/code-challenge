import Joi from "joi";

export const createResourceSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
});

export const updateResourceSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
});
