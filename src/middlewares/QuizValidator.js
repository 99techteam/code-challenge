import Joi from "joi";

const quizSchema = Joi.object({
  answers: Joi.array().items(
    Joi.object({
      questionId: Joi.number().integer().required(),
      answer: Joi.string().trim().required()
    })
  ).min(1).required()
});

export default quizSchema;