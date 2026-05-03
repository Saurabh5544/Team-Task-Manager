const { body } = require('express-validator');

const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 100 })
    .withMessage('Project name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

const updateMembersValidator = [
  body('members')
    .isArray({ min: 1 })
    .withMessage('Members must be a non-empty array of user IDs'),
  body('members.*').isMongoId().withMessage('Each member must be a valid user ID'),
  body('action')
    .isIn(['add', 'remove'])
    .withMessage('Action must be "add" or "remove"'),
];

module.exports = { createProjectValidator, updateMembersValidator };
