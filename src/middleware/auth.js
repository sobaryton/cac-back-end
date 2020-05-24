const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const User = require('../models/user');
const randtoken = require('rand-token');

passport.use(new BearerStrategy(
  (token, done) => {
    User.findOne({token: token}, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, JSON.stringify({
    _id: user._id,
    pseudo: user.pseudo,
  }));
});

passport.deserializeUser((serialisedUser, done) => {
  done(null, JSON.parse(serialisedUser));
});

const authenticate = (req, res, next) => {
  passport.authenticate('bearer', {session: false}, (error, user, info) => {
    if (error) {
      return res.status(500).json({error: error.message});
    }

    if (user === false) {
      const token = randtoken.generate(64);
      const user = new User({
        token,
        pseudo: req.session.pseudo,
      });

      return user.save()
        .then(() => {
          req.login(user, (error) => {
            if (error) {
              return res.status(500).json({error: error.message});
            }

            next();
          });
        })
        .catch((error) => {
          return res.status(500).json({error: error.message});
        });
    }

    req.login(user);
    next();
  })(req, res, next);
};

module.exports = authenticate;
