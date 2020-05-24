const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const CustomStrategy = require('passport-custom').Strategy;
const User = require('../models/user');
const randtoken = require('rand-token');

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
// It creates a new user on the fly and sets the ID in the session
// for retrocompatibility.
passport.use('autologin', new CustomStrategy(
  (req, done) => {
    User.findById(req.session.userID)
      .then((user) => {
        done(null, user);
      })
      .catch((error) => {
        const token = randtoken.generate(64);
        const user = new User({
          token,
          pseudo: req.session.pseudo, // TODO: When removing session, generate pseudo here.
        });

        user.save()
          .then(() => {
            req.login(user, (error) => {
              req.session.userID = user._id;

              done(error, user);
            });
          })
          .catch((error) => {
            done(error);
          });
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

const authenticate = (req, res, next) => {
  passport.authenticate(['bearer', 'autologin'], {session: false})(req, res, next);
};

module.exports = authenticate;
