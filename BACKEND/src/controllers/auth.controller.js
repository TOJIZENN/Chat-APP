import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
export const signup=async(req,res)=>{
    const {fullName,email,password}=req.body;
    try{
        if(!fullName || !email || !password)
        {
            res.status(400).json({error:"all fields are required"});
        }
if(password.length<6)
{

    res.status(400).json({error:"password must be at least 6 characters"});
}
const user=await User.findOne({email})
if(user)
    {
        res.status(400).json({error:"user already exists"});
    }
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt);
    const newUser=new User({
        fullName,
        email,
        password:hashedPassword,
    });
    if(newUser)
    {
generateToken(newUser._id,res);
await newUser.save();
res.status(201).json({
_id:newUser._id,
fullName:newUser.fullName,
email:newUser.email,
profilePic:newUser.profilePic,
})
    }
    else
    {
        res.status(400).json({error:"something went wrong"});
    }
}
    catch(error)
    {
        console.log("Error in signup controller",error.message);
        res.status(500).json({error:"something went wrong"});
    }
};
export const login=async(req,res)=>{
  const{email,password}=req.body
    try{
const user=await User.findOne({email});
if(!user)
    {
       return res.status(400).json({message:"invalid credentialds"});
    }
   const isPasswordCorrect=await bcrypt.compare(password,user.password);
   if(!isPasswordCorrect)
   {
    return res.status(400).json({message:"invalid credentials"});
   }
   generateToken(user._id,res);
   res.status(200).json({
    _id:user._id,
    fullName:user.fullName,
    email:user.email,
    profilePic:user.profilePic,
   })
}
   catch(error)
   {
console.log("Error in login controller",error.message);
res.status(500).json({message:"Internal Server Error"});
   }
}
export const logout=(req,res)=>{
    try{
res.cookie("jwt"," ",{maxAge:0});
res.status(200).json({message:"logged out successfully"});
    }
    catch(error){
console.log("Error in logout controller",error.message);
res.status(500).json({message:"Internal Server Error"})    
}
};

export const updateProfile = async (req, res) => {
try{
const{profilePic}=req.body;
const userId=req.user._id;
if(!profilePic)
{
    return res.status(400).json({message:"profile pic is required"});
}
const uploadResponse=await cloudinary.uploader.upload(profilePic)
const updatedUser=await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});
res.status(200).json(updatedUser);
}
catch(error)
{
console.log("error in update profile:",error);
res.status(500).json({message:"Internal Server Error"});
}
};

export const checkAuth = async (req, res) => {
try{
res.status(200).json(req.user);
}
catch(error)
{
console.log("error in check auth:",error.message);
res.status(500).json({message:"Internal Server Error"});
}

}
