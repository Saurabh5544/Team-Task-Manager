const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, description, assignedTo, projectId, dueDate } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Verify assigned user is a member of the project
    const isMember = project.members.some((m) => m.toString() === assignedTo);
    if (!isMember) {
      return res.status(400).json({ message: 'Assigned user is not a member of this project.' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      assignedTo,
      projectId,
      dueDate,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks (filterable by project)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { projectId, status } = req.query;
    const filter = {};

    if (projectId) {
      filter.projectId = projectId;
    }

    if (status) {
      filter.status = status;
    }

    // Members see only their tasks; Admins see all
    if (req.user.role !== 'Admin') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private (assignee or admin)
const updateTaskStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Only the assigned user or an admin can update status
    if (
      req.user.role !== 'Admin' &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied. Only the assigned user or an admin can update this task.' });
    }

    task.status = req.body.status;
    await task.save();

    const updated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name');

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get task statistics for dashboard
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const filter = {};

    if (projectId) {
      filter.projectId = projectId;
    }

    if (req.user.role !== 'Admin') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter);

    const now = new Date();
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      pending: tasks.filter((t) => t.status === 'Pending').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      overdue: tasks.filter(
        (t) => t.status !== 'Completed' && new Date(t.dueDate) < now
      ).length,
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, updateTaskStatus, getTaskStats };
