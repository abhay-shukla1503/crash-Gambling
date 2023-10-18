const User = require("./models/user");
const bcrypt = require("bcryptjs");
const localStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
  passport.use(
    new localStrategy(
      { username: "identifier" },

      (identifier, password, done) => {
        if (identifier.length > 3) {
          User.findOne(
            {
              $or: [{ username: identifier }, { email: identifier }],
            },

            (err, user) => {
              console.log(identifier, password, user, ">>>>>>>>>>>>>>");
              // if (err) throw err;
              if (!user) return done(null, false);
              bcrypt.compare(password, user.password, (err, result) => {
                if (err) throw err;
                if (result === true) {
                  return done(null, user);
                } else {
                  return done(null, false);
                }
              });
            }
          );
        } else {
          ("username must be greater then 3 characters");
        }
      }
    )
  );

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser((id, cb) => {
    User.findOne({ _id: id }, (err, user) => {
      cb(err, user);
    });
  });
};
