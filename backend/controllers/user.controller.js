
import {User} from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import getDataUri from "../utils/datauri.js";
import cloudinary from '../utils/cloudinary.js';
import { io, getReceiverSocketId } from "../socket/socket.js";


export const register = async (req,res)=>{
    try{
        const{username,email,password}=req.body;
        if(!username || !email || !password){
            return res.status(401).json({
                message:"Something is missing,please check!",
                success:false,
            });
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(401).json({
                message:'try different email',
                success:false,
            });
        };
        const hashedPassword = await bcrypt.hash(password,10)
        await User.create({
            username,
            email,
            password:hashedPassword
        });
        return res.status(201).json({
            message:'Account created successfully',
            success:true,
        });
    
    }catch(error){
        console.log(error);
    }
}


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        message: "Something is missing,please check!",
        success: false,
      });
    }

    let dbUser = await User.findOne({ email });
    if (!dbUser) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, dbUser.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    // ✅ Fix followers key + keep consistent object
    const user = {
      _id: dbUser._id,
      username: dbUser.username,
      email: dbUser.email,
      profilePicture: dbUser.profilePicture,
      bio: dbUser.bio,
      followers: dbUser.followers,   // ✅ fixed
      following: dbUser.following,
      posts: dbUser.posts,
    };

    const token = jwt.sign(
      { userId: dbUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    const isProd = process.env.NODE_ENV === "production";

    // ✅ IMPORTANT: allow cross-site cookies in production
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.id; // from isAuthenticated middleware

    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
        populate: { path: "author", select: "username profilePicture" }, // optional
      })
      .populate({
        path: "bookmarks",
        options: { sort: { createdAt: -1 } },
        populate: { path: "author", select: "username profilePicture" }, // optional
      });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.log("getMe error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const logout = async (_,res)=>{
    try{
        return res.cookie("token","",{maxAge:0}).json({
            message:'logged out Successful',
            success:true
        });
    }catch(error){
        console.log(error);
    }
};
export const getProfile = async(req,res)=>{
    try{
        const userId = req.params.id;
        let user = await User.findById(userId).select('-password');
        return res.status(200).json({
            user,success:true,
        })
    }catch(error){
        console.log(error);
    }
}
export const editProfile = async(req,res)=>{
    try{
        const userId = req.id;
        const{bio,gender}=req.body;
        const profilePicture = req.file;
        let cloudResponse;
        if(profilePicture){
          const fileUri = getDataUri(profilePicture);
           cloudResponse = await cloudinary.uploader.upload(fileUri); 
        }
        const user = await User.findById(userId).select('-password');
        if(!user){
            return res.status(404).json
({
    message:'User not Found!',
    success:false,
}) 
       };
       if(bio) user.bio = bio;
       if(gender) user.gender = gender;
       if(profilePicture) user.profilePicture = cloudResponse.secure_url;
       await user.save();
       return res.status(200).json
       ({
           message:'Profile updated.',
           success:true,user
       }) 
    }catch(error){
        console.log(error);
    }
}
export const getSuggestedUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // ✅ use this

    const suggestedUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    return res.status(200).json({
      success: true,
      users: suggestedUsers, // ✅ users (plural)
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const followOrUnfollow = async (req, res) => {
  try {
    const followKrneWala = req.id;
    const jiskoFollowKrunga = req.params.id;

    if (followKrneWala === jiskoFollowKrunga) {
      return res.status(400).json({
        message: "You cannot follow/unfollow yourself",
        success: false,
      });
    }

    // validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(followKrneWala) ||
      !mongoose.Types.ObjectId.isValid(jiskoFollowKrunga)
    ) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(followKrneWala);
    const targetUser = await User.findById(jiskoFollowKrunga);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // IMPORTANT: handle missing arrays (older documents)
    const myFollowing = user.following || [];
    const isFollowing = myFollowing.some((id) => id.toString() === jiskoFollowKrunga);

    if (isFollowing) {
      await Promise.all([
        User.updateOne({ _id: followKrneWala }, { $pull: { following: jiskoFollowKrunga } }),
        User.updateOne({ _id: jiskoFollowKrunga }, { $pull: { followers: followKrneWala } }),
      ]);

      return res.status(200).json({
        message: "Unfollowed successfully",
        success: true,
        following: false,
      });
    } else {
      await Promise.all([
        User.updateOne({ _id: followKrneWala }, { $addToSet: { following: jiskoFollowKrunga } }),
        User.updateOne({ _id: jiskoFollowKrunga }, { $addToSet: { followers: followKrneWala } }),
      ]);
      const senderUser = await User.findById(followKrneWala).select(
    "username profilePicture"
  );

  const notification = {
    type: "follow",
    userId: followKrneWala,
    userDetails: senderUser,
    message: "started following you",
  };

  emitToUserAndSelfInDev(
    jiskoFollowKrunga,
    followKrneWala,
    "notification",
    notification
  );

  return res.status(200).json({
    message: "Followed successfully",
    success: true,
    following: true,
  });

    }
  } catch (error) {
    console.error("followOrUnfollow error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// socket helper
const emitToUser = (userId, event, payload) => {
  const socketId = getReceiverSocketId(String(userId));
  if (socketId) {
    io.to(socketId).emit(event, payload);
  }
};

const emitToUserAndSelfInDev = (receiverId, senderId, event, payload) => {
  // send to actual receiver
  emitToUser(receiverId, event, payload);

  // ✅ DEV ONLY: echo back to sender (single-login testing)
  if (process.env.NODE_ENV !== "production") {
    emitToUser(senderId, event, payload);
  }
};

console.log("getReceiverSocketId:", typeof getReceiverSocketId);


