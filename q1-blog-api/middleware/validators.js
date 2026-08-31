const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const postValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array').custom((tags) => {
    if (tags && !tags.every((t) => typeof t === 'string')) {
      throw new Error('Each tag must be a string');
    }
    return true;
  }),
  body('published').optional().isBoolean().withMessage('Published must be a boolean'),
  handleValidationErrors,
];

const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  postValidation,
  mongoIdValidation,
  handleValidationErrors,
};
