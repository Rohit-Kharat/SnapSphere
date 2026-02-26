import jwt from "jsonwebtoken";

const safeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  profilePicture: user.profilePicture,
  bio: user.bio,
  followers: user.followers,
  following: user.following,
  posts: user.posts,
});

export const oauthSuccess = async (req, res) => {
  try {
    const user = req.user;

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    // ✅ safest way (works even if CLIENT_URL has / at end)
    const redirectUrl = new URL("/auth/success", process.env.CLIENT_URL).toString();
    return res.redirect(redirectUrl);
  } catch (err) {
    console.log(err);
    return res.redirect("http://localhost:3000/login?error=oauth_failed");
  }
};

