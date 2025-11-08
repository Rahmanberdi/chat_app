import User from '../models/user.model.js';
import {generateToken} from "../lib/utils.js";
import bcrypt from 'bcryptjs';
export const signup = async(req,res)=>{
    const {fullName, email, password} = req.body;
    const name = typeof fullName === "string" ? fullName.trim():"";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase():"";
    const pass = typeof password === "string" ? password :"";
    try{
         if (!name || !normalizedEmail || !pass){
             return res.status(400).json({message:"All fields are required"});
         }
         if (pass.length<8){
             return res.status(400).json({message:"Password must be at least 8 characters"});
         }
         //check if emails valid:regex
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(normalizedEmail)){
             return res.status(400).json({message:"Invalid email format"});
         }

         const user = await User.findOne({normalizedEmail});
        if(user) return res.status(400).json({message:"Email already exists"});

        const hashedPassword = await bcrypt.hash(pass, 10);

        const newUser = new User({
            fullName:name,
            email:normalizedEmail,
            password:hashedPassword,
        })
        if (newUser){
            const savedUser = await newUser.save();
            generateToken(savedUser._id,res);

            res.status(201).json({
                _id: savedUser._id,
                fullName:savedUser.fullName,
                email:savedUser.email,
                profilePic:savedUser.profilePic,

            });
        }else{
            res.status(400).json({message:"Invalid user data"});
        }
    }catch (error) {
        console.log("Error in signup controller",error);
        res.status(500).json({message:"Internal Server Error"});
    }
}
