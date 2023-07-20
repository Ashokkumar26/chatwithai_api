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

const userChatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  userMessage: {
    type: String,
    required: true
  },
  aiResponse: {
    type: String,
    required: true
  },
  dateTime: {
    type: String,
    required: true
  }
})

// Create a model from the schema
const SetUser = mongoose.model('User', setUserSchema);
const GetUser = mongoose.model('Users', getUserSchema);
const SetUserChat = mongoose.model('Message', userChatSchema)
module.exports = { SetUser, GetUser, SetUserChat }
