import User from '../models/User.js';
import Leave from '../models/Leave.js';
import Attendance from '../models/Attendance.js';

// @desc    Get users list according to role permission
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    let query = {};

    // HR can view all employees
    // Manager can view employees in their own department
    // Employee can view department peers or self
    if (req.user.role === 'Manager') {
      query.department = req.user.department;
    } else if (req.user.role === 'Employee') {
      // Allowed to view department team members
      query.department = req.user.department;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('[GetUsers Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Role check: Employee can only view self or colleagues
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[GetUserById Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
    });
  }
};

// @desc    Create employee / user (HR only)
// @route   POST /api/users
// @access  Private (HR)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, phone, profileImage } = req.body;

    if (!name || !email || !password || !department || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, department, and phone',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Employee',
      department,
      phone,
      profileImage: profileImage || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[CreateUser Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user',
    });
  }
};

// @desc    Update employee / user
// @route   PUT /api/users/:id
// @access  Private (HR or Self)
export const updateUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const isSelf = req.user._id.toString() === targetId;
    const isHR = req.user.role === 'HR';

    if (!isSelf && !isHR) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this profile',
      });
    }

    const user = await User.findById(targetId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { name, phone, department, role, profileImage, password } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;

    // Only HR can update role and department of other users
    if (isHR) {
      if (department) user.department = department;
      if (role && ['HR', 'Manager', 'Employee'].includes(role)) user.role = role;
    }

    if (password && password.trim().length >= 6) {
      user.password = password; // Pre-save hook will hash this
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[UpdateUser Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user',
    });
  }
};

// @desc    Delete employee / user (HR only)
// @route   DELETE /api/users/:id
// @access  Private (HR)
export const deleteUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    if (req.user._id.toString() === targetId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own HR administrator account',
      });
    }

    const user = await User.findById(targetId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Clean up related records
    await Leave.deleteMany({ employee: targetId });
    await Attendance.deleteMany({ employee: targetId });
    await User.findByIdAndDelete(targetId);

    return res.status(200).json({
      success: true,
      message: 'Employee record and associated records deleted successfully',
    });
  } catch (error) {
    console.error('[DeleteUser Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};
