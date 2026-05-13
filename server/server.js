import express from 'express'
import cors from 'cors';
import 'dotenv/config'
import { clerkMiddleware, requireAuth, } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';



const app=express()
//cloudinary

await connectCloudinary()
console.log(process.env.CLIPDROP_API_KEY)
//add middleware
app.use(cors())//reqest send
app.use(express.json())// 
app.use(clerkMiddleware())


app.get('/',(req,res)=>res.send('server is live'))


app.use('/api/ai',aiRouter)
app.use('/api/user',userRouter)

const PORT=process.env.PORT || 3000;




app.use((req, res, next) => {

    console.log("METHOD:", req.method);

    console.log("URL:", req.url);

    console.log("BODY:", req.body);

    console.log("HEADERS:", req.headers);

    next();

});
console.log('gemini key')
console.log(process.env.GEMINI_API_KEY)