import mongoose from "mongoose";
import {ENV} from "./env.js";

export const connectDB = async () => {
    try{
        const {MONGO_URI} = ENV;
        if (!MONGO_URI) throw new Error("MongoDB URI is required");
        const conn = await mongoose.connect(MONGO_URI,{serverSelectionTimeoutMS:10000});
        console.log("MongoDB Connected:",conn.connection.host);
    }catch(error){
        console.log("Error connecting to MongoDB:",error);
        throw error;
    }
}