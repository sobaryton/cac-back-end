const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const CustomStrategy = require('passport-custom').Strategy;
const User = require('../models/user');
const randtoken = require('rand-token');
const generateRandomName = require('../utils/nameGenerator');

// This logs in the user using the token sent by the front-end.
passport.use(new BearerStrategy(
  (token, done) => {
    User.findOne({token: token})
      .then((user) => {
        done(null, user);
      })
      .catch((error) => {
        done(error);
      });
  }
));

// This strategy assumes all other auth strategies failed.
// It creates a new user on the fly.
passport.use('autologin', new CustomStrategy(
  (req, done) => {
    const token = randtoken.generate(64);
    const pseudo = generateRandomName();
    const user = new User({
      token,
      pseudo,
    });

    user.save()
      .then(() => {
        req.login(user, (error) => {
          done(error, user);
        });
      })
      .catch((error) => {
        done(error);
      });
  }
));

// Serialize / deserialize from JSON to avoid calling MongoDB every time.
passport.serializeUser((user, done) => {
  done(null, JSON.stringify(user));
});

passport.deserializeUser((serialisedUser, done) => {
  done(null, JSON.parse(serialisedUser));
});

const authenticateWithAutologin
  = passport.authenticate(['bearer', 'autologin'], {session: false});

const authenticate
  = passport.authenticate(['bearer'], {session: false});

module.exports = {
  authenticate,
  authenticateWithAutologin,
};
