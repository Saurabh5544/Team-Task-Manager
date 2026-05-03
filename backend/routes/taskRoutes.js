const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTaskStatus,
  getTaskStats,
} = require('../controllers/taskController');
const {
  createTaskValidator,
  updateTaskStatusValidator,
} = require('../validators/taskValidator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/stats', auth, getTaskStats);
router.post('/', auth, roleCheck('Admin'), createTaskValidator, createTask);
router.get('/', auth, getTasks);
router.put('/:id/status', auth, updateTaskStatusValidator, updateTaskStatus);

module.exports = router;
