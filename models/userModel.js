const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have name'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'A user must have email'],
    lowercase: true,
    validate: [validator.isEmail, 'A user must have email'],
  },
  photo: {
    type: String,
    required: [false, 'A user must have photo'],
  },
  password: {
    type: String,
    required: [true, 'A user must have password'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'A user must have Confirm password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not same',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
