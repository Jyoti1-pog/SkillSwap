const router = require('express').Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Only set up Google strategy if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'));

        let user = await User.findOne({ email });

        if (!user) {
          // Create new user from Google profile
          user = await User.create({
            name: profile.displayName,
            email,
            password: uuidv4(), // random password — they'll use Google to log in
            avatar: profile.photos?.[0]?.value || null,
            isEmailVerified: true,
            referralCode: uuidv4().slice(0, 8).toUpperCase(),
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (e) { done(e); }
  });

  router.get('/', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }));

  router.get('/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/auth/login?error=google_failed' }),
    (req, res) => {
      const token = generateToken(req.user._id);
      const needsOnboarding = !req.user.onboardingCompleted;
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      // Redirect to frontend with token in URL fragment (no localStorage access from server)
      res.redirect(`${clientUrl}/auth/google/success?token=${token}&onboarding=${needsOnboarding}`);
    }
  );
} else {
  // Placeholder routes when Google OAuth is not configured
  router.get('/', (req, res) => {
    res.status(503).json({ error: 'Google OAuth not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env' });
  });
  router.get('/callback', (req, res) => {
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/login?error=google_not_configured`);
  });
}

module.exports = router;
