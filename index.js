const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Configuration, OpenAIApi } = require("openai");
const { SetUser, GetUser, SetUserChat } = require('./schema/loginUser');
var jwt = require('jsonwebtoken');
const twilio = require('twilio');
var CryptoJS = require("crypto-js");

const app = express();
app.use(cors());
app.use(express.json());

const url = 'mongodb+srv://ashokkumar:OP8G3Uckv5O6ONI9@cluster0.wbtkj2q.mongodb.net/';
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
};
mongoose.connect(url, options)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start your application or perform database operations here
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
  });
  
  mongoose.connection.on('error', (error) => {
    console.error('Mongoose connection error:', error);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
  });
  
  // Gracefully close the connection on application termination
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose connection closed due to application termination');
      process.exit(0);
    });
  });

  // code commented cause need to purchase twilio

// const accountSid = 'ACc93c4d60a210d52862f3d8eed26a1f6c';
// const authToken = 'ad24218610e74affa678d433119bddf2';
// // fQsWesFBeRAieoX4KqEzGBJ5EL8KfT-p6CYhtxEJ  - recovery number

// const client = twilio(accountSid, authToken);

// function sendOTPViaSMS(toPhoneNumber, otpCode) {
//     const fromPhoneNumber = '+14842761723';
  
//     client.messages
//       .create({
//         body: `Your OTP is: ${otpCode}`,
//         from: fromPhoneNumber,
//         to: toPhoneNumber,
//       })
//       .then(message => console.log('OTP message sent:', message.sid))
//       .catch(error => console.error('Error sending OTP message:', error));
//   }
//   const phoneNumber = '+919003439284'; // Phone number to send OTP to
// const otpCode = '123456'; // Generated OTP code
// sendOTPViaSMS(phoneNumber, otpCode);


async function chatInitiation(message, key) {
  const configuration = new Configuration({
    apiKey: key,
  });
  const openai = new OpenAIApi(configuration);
    // role - defined as 'system', 'assistant', 'user', 'function'
    const chatCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: message}],
      });
      return chatCompletion.data.choices[0].message
}

// Generate a JWT token
function generateToken(payload, secret, expiresIn) {
  return jwt.sign(payload, secret, { expiresIn });
}

// Verify and decode a JWT token
function validateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid or missing Authorization header' });
      }
      const ciphertext = authHeader.split(' ')[1];
      let bytes  = CryptoJS.AES.decrypt(ciphertext, 'secretkey1');
      let originalText = bytes.toString(CryptoJS.enc.Utf8).split('chatwithai')
    jwt.verify(originalText[0], secret, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = decoded;
        req.apiKey = originalText[1]
        next()
})
}
// Example usage
const secret = 'your-secret-key';
const expiresIn = '1h';


app.post('/signup', async (req, res) => {
    const newUser = new SetUser(req.body);
      newUser.save()
        .then(() => {
          console.log('User saved successfully');
          res.json({ status: 200, message: 'User saved successfully' })
        })
        .catch((error) => {
          console.error('Failed to save user:', error);
          res.json({ status: 200, message: `Failed to save user: ${error}` })
        });
      
})

app.post('/login', async (req, res) => {
    GetUser.find(req.body).then(user=>{
        if(user.length){
            const token = generateToken(req.body, secret, expiresIn);
            res.json({ status: 200, message: "user logged In successfully", token })
        } else {
            res.json({ status: 200, message: `Invalid username or password` })
        }
    }).catch(error=> {
        res.json({ status: 200, message: "something went wrong:" + error })
    })
})
// Define API endpoint
app.post('/chat', validateToken, async (req, res) => {
  try {
    const { message } = req.body;
    // console.log("Req::", req.user, req.body);
    // Check if the token is provided
    let response = await chatInitiation(message, req.apiKey);
    let time = new Date().toLocaleTimeString();
    let date = new Date().toLocaleDateString();
    let data = {name: req.user.name,
       userMessage: message,
      aiResponse: response.content,
      dateTime: date.concat(` ${time}`)
    }
    let userChat = new SetUserChat(data);
    userChat.save();
    res.json({ message: response  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
 