const mongoose = require('mongoose');

// Define a schema
const setUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: Number,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
});

const getUserSchema = new mongoose.Schema({
    name: String,
    password: String
});

// Create a model from the schema
const SetUser = mongoose.model('User', setUserSchema);
const GetUser = mongoose.model('Users', getUserSchema);
module.exports = { SetUser, GetUser }
