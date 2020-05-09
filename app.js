const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userSession = require('./src/middleware/sessions');
const gameRoutes = require('./src/routes/game');
const userRoutes = require('./src/routes/user');
const cors = require('cors');
const dotenv = require('dotenv');

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

app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'CACoro',
  // connect-mongo session store
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  proxy: true,
  resave: true,
  saveUninitialized: true,
  cookie: {
    // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // disallows manipulating the cookie with client-side Javascript
    httpOnly: true,
    // TODO: when website in production, would be good to set to "strict"
    sameSite: 'none',
    // cookies only sent by client on HTTPS connections
    // (disabled for testing and dev)
    secure: 'dev' !== process.env.APP_ENV,
  },
}));

app.use(bodyParser.json());

// Allow any website to call this API.
app.use(cors({
  credentials: true,
  origin: (origin, callback) => callback(null, true),
}));

app.use('/user', userSession, userRoutes);

app.use('/game', userSession, gameRoutes);

module.exports = app;
