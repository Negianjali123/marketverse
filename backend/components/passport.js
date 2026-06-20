import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { createSession } from './session.js';

export default passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/api/auth/google/callback"
},
  async function (accessToken, refreshToken, profile, cb) {
    try {

      // Check if user already exists
      const user = await User.findOne({ googleID: profile.id });

      if (!user) {
        await User.create({
          googleID: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          role:"buyer",
          password:null,
          authProvider: profile.provider,
        });

      }

      return cb(null, user);
    } catch (err) {
      return cb(err, null);
    }
  }
));

// // Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// // Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
