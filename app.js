const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const gameRoutes = require('./src/routes/game');
const userRoutes = require('./src/routes/user');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const auth = require('./src/middleware/auth');

dotenv.config();

const app = express();

mongoose.connect(
  process.env.MONGO_DB_CONNECTION_STRING,
  {useUnifiedTopology: true, useNewUrlParser: true}
).then(() => {
  console.log('Successfully connected to Mongo DB Atlas');
}).catch((error) => {
  console.log('Error when connecting to MongoDB');
  console.error(error);
});

app.use(passport.initialize());

app.use(bodyParser.json());

// Allow only our websites to call this API.
app.use(cors({
  origin: [/^https?:\/\/localhost(:\d+)?$/, 'https://cards-against-coronavirus.sodev.me'],
}));

// These routes have different authentication methods defined at
// each endpoint level.
app.use('/user', userRoutes);

// All these routes must be authenticated with a valid token.
app.use('/game', auth.authenticate, gameRoutes);

module.exports = app;
