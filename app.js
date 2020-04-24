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

const app = express();

mongoose.connect('mongodb+srv://Solene:ErnAC6bJ95UzC8M4@cluster0-flsqa.mongodb.net/CardsAgainstCoronavirus?retryWrites=true&w=majority',  { useUnifiedTopology: true, useNewUrlParser: true })
.then(()=>{
    console.log('Successfully connected to Mongo DB Atlas');
})
.catch(error=>{
    console.log('Error when connecting to MongoDB');
    console.error(error);
});

app.use(session({
    secret: '5896kjkbef654ergojn5',
    name: 'CACoro',
    store: new MongoStore({ mongooseConnection: mongoose.connection }), // connect-mongo session store
    proxy: true,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true
    }
}));

app.use(bodyParser.json());

app.use(cors({
    credentials: true,
    origin: (origin, callback) => callback(null, true),
}));

app.use('/user', userSession, userRoutes);

app.use('/game', userSession, gameRoutes);

module.exports = app;