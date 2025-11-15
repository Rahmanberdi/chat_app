import User from '../models/user.model.js';
import {generateToken} from "../lib/utils.js";
import bcrypt from 'bcryptjs';
import {sendWelcomeEmail} from "../emails/emailHandlers.js";

import {ENV} from "../lib/env.js"




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
            //todo: send a welcome email to user
            try{
                await sendWelcomeEmail(savedUser.email, savedUser.fullName,ENV.CLIENT_URL);
            }catch (error){
                console.error("Error creating email ", error)
            }
        }else{
            res.status(400).json({message:"Invalid user data"});
        }
    }catch (error) {
        console.log("Error in signup controller",error);
        res.status(500).json({message:"Internal Server Error"});
    }
}


export const login = async(req,res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email})
        if(!user){return res.status(400).json({message:"Invalid credentials"});}

        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){return res.status(400).json({message:"Invalid credentials"});}
        generateToken(user._id,res)
        res.status(200).json({
            _id:user._id,
            email:user.email,
            fullName:user.fullName,
            profilePic:user.profilePic,
        });
    }catch (error){
        console.error("Error in login controller",error);
        res.status(500).json({message:"Internal Server Error"});
    }

}


export const logout = async(_,res) => {
    res.cookie("jwt","",{maxAge:0})
    res.status(200).json({message:"Logged out successfully"});

}