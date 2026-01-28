import express from "express";
import passport from "passport";
import { oauthSuccess } from "../controllers/auth.controller.js";

const router = express.Router();

// Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  oauthSuccess
);



export default router;
