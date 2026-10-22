const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Attendee = require('../models/Attendee');
const { getMongoStatus } = require('../config/db');
const { inMemoryData, generateId } = require('../config/inMemoryDb');

const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'eventhub_super_secret_jwt_key_2026';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate attendee, issue token
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    let attendee = null;

    if (getMongoStatus()) {
      attendee = await Attendee.findOne({ email: email.toLowerCase() });
    } else {
      attendee = inMemoryData.attendees.find(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      );
    }

    if (!attendee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = bcrypt.compareSync(password, attendee.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.'
      });
    }

    const attendeeId = attendee._id.toString();
    const token = signToken({
      id: attendeeId,
      name: attendee.name,
      email: attendee.email,
      role: attendee.role || 'attendee'
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      attendee: {
        id: attendeeId,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        role: attendee.role || 'attendee'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new attendee
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required fields.'
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    if (getMongoStatus()) {
      const existing = await Attendee.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An attendee with this email already exists.'
        });
      }

      const newAttendee = await Attendee.create({
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role: role || 'attendee'
      });

      const token = signToken({
        id: newAttendee._id.toString(),
        name: newAttendee.name,
        email: newAttendee.email,
        role: newAttendee.role
      });

      return res.status(201).json({
        success: true,
        message: 'Attendee registered successfully',
        token,
        attendee: {
          id: newAttendee._id.toString(),
          name: newAttendee.name,
          email: newAttendee.email,
          phone: newAttendee.phone,
          role: newAttendee.role
        }
      });
    } else {
      const existing = inMemoryData.attendees.find(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An attendee with this email already exists.'
        });
      }

      const newAttendee = {
        _id: generateId(),
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role: role || 'attendee',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryData.attendees.push(newAttendee);

      const token = signToken({
        id: newAttendee._id,
        name: newAttendee.name,
        email: newAttendee.email,
        role: newAttendee.role
      });

      return res.status(201).json({
        success: true,
        message: 'Attendee registered successfully',
        token,
        attendee: {
          id: newAttendee._id,
          name: newAttendee.name,
          email: newAttendee.email,
          phone: newAttendee.phone,
          role: newAttendee.role
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register
};
