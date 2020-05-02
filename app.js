const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const Game = require('./src/models/game');
const mongoose = require ('mongoose');
const userSession = require('./src/middleware/sessions');
const gameRoutes = require('./src/routes/game');
const userRoutes = require('./src/routes/user');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING, { useUnifiedTopology: true, useNewUrlParser: true })
.then(()=>{
    console.log('Successfully connected to Mongo DB Atlas');
})
.catch(error=>{
    console.log('Error when connecting to MongoDB');
    console.error(error);
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    name: 'CACoro',
    store: new MongoStore({ mongooseConnection: mongoose.connection }), // connect-mongo session store
    proxy: true,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true, // disallows manipulating the cookie with client-side Javascript
      sameSite: 'strict', // cookies only sent if URL matches
      secure: true, // cookies only sent with HTTPS calls
    }
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
