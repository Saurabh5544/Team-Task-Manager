const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description: description || '',
      members: [req.user._id],
      createdBy: req.user._id,
    });

    const populated = await Project.findById(project._id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects the user belongs to
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'Admin') {
      query = Project.find();
    } else {
      query = Project.find({ members: req.user._id });
    }

    const projects = await query
      .populate('members', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Members can only view projects they belong to
    if (
      req.user.role !== 'Admin' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Add or remove members from project
// @route   PUT /api/projects/:id/members
// @access  Private/Admin
const updateMembers = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { members, action } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Verify all member IDs exist
    const users = await User.find({ _id: { $in: members } });
    if (users.length !== members.length) {
      return res.status(400).json({ message: 'One or more user IDs are invalid.' });
    }

    if (action === 'add') {
      const newMembers = members.filter(
        (id) => !project.members.map((m) => m.toString()).includes(id)
      );
      project.members.push(...newMembers);
    } else if (action === 'remove') {
      project.members = project.members.filter(
        (m) => !members.includes(m.toString())
      );
    }

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getProjects, getProject, updateMembers };
