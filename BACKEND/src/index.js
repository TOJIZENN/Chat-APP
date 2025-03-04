import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import path from "path";
import { connectDB } from "./lib/db.js";
import authRoute from "./routes/auth.route.js"; 
import messageRoute from "./routes/message.route.js"
import cors from "cors";
import { app,server } from "./lib/socket.js";
dotenv.config();
const __dirname = path.resolve();
const PORT=process.env.PORT
app.use(express.json({ limit: '50mb' })); // Increase limit to 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());
app.use(cors(
    { 
        origin:"http://localhost:5173",
        credentials:true
    }
));
  
app.use("/api/auth",authRoute);
app.use("/api/messages",messageRoute);
if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../FRONTEND/dist")));
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"../FRONTEND","dist","index.html"));
    });
}
server.listen(5001,()=>{
    console.log("server is running on port" + PORT);
connectDB()
});
