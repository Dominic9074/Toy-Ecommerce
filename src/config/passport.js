import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModal.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://wheelz.dominickb.online/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        user=await User.findOne({email:profile.emails[0].value})

        if(user){
          user.googleId=profile.id;
          user.provider='google'
          await user.save();
          return done(null,user)
        }

        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          provider: "google"
        });

        await user.save();
        return done(null, user);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// session serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;