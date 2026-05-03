const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateMembers,
} = require('../controllers/projectController');
const {
  createProjectValidator,
  updateMembersValidator,
} = require('../validators/projectValidator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, roleCheck('Admin'), createProjectValidator, createProject);
router.get('/', auth, getProjects);
router.get('/:id', auth, getProject);
router.put('/:id/members', auth, roleCheck('Admin'), updateMembersValidator, updateMembers);

module.exports = router;
