import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import GitHubStrategy from "passport-github";
import { authenticateOAuthUser, isUserExist } from "../service/auth.service.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authenticateOAuthUser(profile, "google");
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authenticateOAuthUser(profile, "github");
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await isUserExist(id); // reuse your existing DB helper
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
