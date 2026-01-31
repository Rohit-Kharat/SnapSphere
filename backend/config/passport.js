import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js"; 


const slugify = (str = "") =>
  str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

const generateUniqueUsername = async (base, User) => {
  let username = slugify(base) || "user";
  let exists = await User.findOne({ username });

  while (exists) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    username = `${slugify(base)}${suffix}`;
    exists = await User.findOne({ username });
  }

  return username;
};

export const setupPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase() || null;

          let user = await User.findOne({ googleId: profile.id });

          if (!user && email) {
            user = await User.findOne({ email });
            if (user && !user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
          }

          if (!user) {
            const baseName =
              profile.displayName ||
              (email ? email.split("@")[0] : "user");

            const uniqueUsername = await generateUniqueUsername(baseName, User);

            user = await User.create({
              username: uniqueUsername,
              email,
              googleId: profile.id,
              profilePicture: profile.photos?.[0]?.value,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};
