import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use('/api/auth',authRoute);
app.use('/api/messages',messageRoute);

app.listen(PORT,()=>{ 
    console.log(`Server running on  https://localhost:${PORT}`);
    
});
