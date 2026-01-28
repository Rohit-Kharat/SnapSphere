import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,function () {
    // password required only if user is NOT OAuth user
    return !this.googleId; // (and later add !this.facebookId if needed)
  },
},

    profilePicture:{type:String,default:''},
    bio:{type:String,default:""},
    gender:{type:String,enum:['male','female']},
    googleId: { type: String, unique: true, sparse: true },
    followers:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    following:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    posts:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],
    bookmarks:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}]

},{timestamps:true});
export const User = mongoose.model('User',userSchema);