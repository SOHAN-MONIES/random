const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    const token = signToken(newUser._id);
    res.status(201).json({
      status: 'Success',
      token,
      data: { user: newUser },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      err: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //Check email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please enter both email and password',
      });
    }
    //Check if user exists and password is crt
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(400).json({
        status: 'fail',
        message: 'Incorrect Password or email',
      });
    }
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      err: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    //Get the token and check its there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      // console.log(token);
    }
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        err: 'Not Logged In',
      });
    }
    //Verfication token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'Failed',
        err: 'User doesnt not exists',
      });
    }
    //Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'Failed',
        err: 'User recently changed Password',
      });
    }
    next();
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      err: err.message,
    });
  }
};
