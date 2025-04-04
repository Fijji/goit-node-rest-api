import HttpError from "./HttpError.js";

const validateBody = (schema) => {
  return (req, _, next) => {
    if (!Object.keys(req.body).length) {
      return next(HttpError(400, "Body must have at least one field"));
    }

    const {error} = schema.validate(req.body);
    if (error) {
      return next(HttpError(400, error.message));
    }
    next();
  };
};

export default validateBody;
