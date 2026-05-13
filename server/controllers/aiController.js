import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient, getAuth } from "@clerk/express";
import {v2 as cloudinary} from "cloudinary"

import axios from "axios";
import FormData from "form-data";


//file for pdf
import fs from 'fs';
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// GENERATE ARTICLE
export const generateArticle = async (req, res) => {

    try {

        // get logged in user
        const { userId } = getAuth(req);

        console.log("USER ID:", userId);

        // check auth
        if (!userId) {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }

        // frontend data
        const { prompt, length } = req.body;

        // middleware data
        const plan = req.plan;
        const free_usage = req.free_usage;

        // free plan limit
        if (plan !== 'premium' && free_usage >= 10) {

            return res.json({
                success: false,
                message: "Limit reached. Upgrade to continue"
            });

        }

        // AI response
        const response = await AI.chat.completions.create({

            model: "gemini-3-flash-preview",

            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],

            temperature: 0.7,

            max_tokens: Number(length),

        });

        // generated content
        const content =
            response.choices[0].message.content;
         console.log(content);
        // save in database
        await sql`
        INSERT INTO creations
        (user_id, prompt, content, type)

        VALUES
        (${userId}, ${prompt}, ${content}, 'article')
        `;

        // increase free usage
        if (plan !== 'premium') {

            await clerkClient.users.updateUser(userId, {

                privateMetadata: {
                    free_usage: free_usage + 1,
                    plan: plan
                }

            });

        }

        // send response
        res.json({
            success: true,
            content
        });

    }
    catch (error) {

        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });

    }
};


// GENERATE BLOG TITLE
export const generateBlogTitle = async (req, res) => {

    try {

        // get logged in user
        const { userId } = getAuth(req);

        // check auth
        if (!userId) {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }

        // frontend data
        const { prompt } = req.body;

        // middleware data
        const plan = req.plan;
        const free_usage = req.free_usage;

        // free plan limit
        if (plan !== 'premium' && free_usage >= 10) {

            return res.json({
                success: false,
                message: "Limit reached. Upgrade to continue"
            });

        }

        // AI response
        const response = await AI.chat.completions.create({

            model: "gemini-3-flash-preview",

            messages: [
                {
                    role: "user",
                    content: `Generate 5 blog titles for keyword ${prompt}`             
               },
            ],

            temperature: 0.7,

            max_tokens: 2000,

        });

        // generated content
        const content =
            response.choices[0].message.content;
        console.log(content);
        // save in database
        await sql`
        INSERT INTO creations
        (user_id, prompt, content, type)

        VALUES
        (${userId}, ${prompt}, ${content}, 'blog-title')
        `;

        // increase free usage
        if (plan !== 'premium') {

            await clerkClient.users.updateUser(userId, {

                privateMetadata: {
                    free_usage: free_usage + 1,
                    plan: plan
                }

            });

        }

        // send response
        res.json({
            success: true,
            content
        });

    }
    catch (error) {

        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });

    }
};


// GENERATE IMAGE
export const generateImage = async (req, res) => {

    try {

        console.log("1");

        // get logged in user
        const { userId } = getAuth(req);

        console.log("USER:", userId);

        // check auth
        if (!userId) {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }

        console.log("2");

        // frontend data
        const { prompt, publish } = req.body;

        // middleware data
        const plan = req.plan;

        // premium check
        // if (plan !== 'premium') {

        //     return res.json({
        //         success: false,
        //         message: "This feature is only available for premium subscriptions"
        //     });

        // }

        console.log("3");

        // create form data
        const form = new FormData();

        form.append("prompt", prompt);

        console.log("4");

        console.log(form.getHeaders());

        console.log(process.env.CLIPDROP_API_KEY);

        // generate image from clipdrop
        const response = await axios.post(
            "https://clipdrop-api.co/text-to-image/v1",
            form,
            {
                headers: {
                    'x-api-key': process.env.CLIPDROP_API_KEY,
                    ...form.getHeaders()
                },
                responseType: "arraybuffer",
            }
        );

        console.log("5");

        const data = response.data;

        // convert image to base64
        const base64Image =
            `data:image/png;base64,${
                Buffer.from(data, 'binary').toString('base64')
            }`;

        console.log("6");

        console.log(base64Image.slice(0, 100));

        // upload to cloudinary
        const uploadResult =
            await cloudinary.uploader.upload(base64Image);

        console.log("7");

        const secure_url = uploadResult.secure_url;

        // save in database
        await sql`
        INSERT INTO creations
        (user_id, prompt, content, type, publish)

        VALUES
        (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
        `;

        console.log("8");

        // send response
        res.json({
            success: true,
            content: secure_url
        });

    }
    catch (error) {

        console.log("ERROR:");

        console.log(
            error.response?.data ||
            error.message ||
            error
        );

        res.json({
            success: false,
            message: error.message
        });

    }
};


//to remove image background
export const removeImageBackground = async (req, res) => {

    try {

        console.log("1");

        // get logged in user
        const { userId } = getAuth(req);
        const image=req.file

        console.log("USER:", userId);

        // check auth
        if (!userId) {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }

        console.log("2");


        // middleware data
        const plan = req.plan;

        // premium check
        // if (plan !== 'premium') {

        //     return res.json({
        //         success: false,
        //         message: "This feature is only available for premium subscriptions"
        //     });

        // }

     
 

        const {secure_url }= await cloudinary.uploader.upload(image.path,{
            transformation:[
                {
                    effect:'background_removal',
                    background_removal:'remove_the_background'
                }
            ]
        })




        // save in database
        await sql`
        INSERT INTO creations
        (user_id, prompt, content, type)

        VALUES
        (${userId}, 'remove background from image', ${secure_url}, 'image')
        `;

        console.log("8");

        // send response
        res.json({
            success: true,
            content: secure_url
        });

    }
    catch (error) {

        console.log("ERROR:");

        console.log(
            error.response?.data ||
            error.message ||
            error
        );

        res.json({
            success: false,
            message: error.message
        });

    }
};

//to remove any object
export const removeImageObject = async (req, res) => {

    try {

        console.log("1");

        // get logged in user
        const { userId } = getAuth(req);
        const {object}=req.body
        const image=req.file

        console.log("USER:", userId);

        // check auth
        if (!userId) {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }

        console.log("2");


        // middleware data
        const plan = req.plan;

        // premium check
        // if (plan !== 'premium') {

        //     return res.json({
        //         success: false,
        //         message: "This feature is only available for premium subscriptions"
        //     });

        // }

     
 

        const {public_id }= await cloudinary.uploader.upload(image.path)
        const imageUrl=cloudinary.url(public_id,{
            transformation:[{effect:`gen_remove:${object}`}],
            resource_type:'image'

        })





        // save in database
        await sql`
        INSERT INTO creations
        (user_id, prompt, content, type)

        VALUES
        (${userId}, ${`Remove ${object } from the image `}, ${imageUrl}, 'image')
        `;

        console.log("8");

        // send response
        res.json({
            success: true,
            content:imageUrl
        });

    }
    catch (error) {

        console.log("ERROR:");

        console.log(
            error.response?.data ||
            error.message ||
            error
        );

        res.json({
            success: false,
            message: error.message
        });

    }
};
// TO REVIEW RESUME
export const resumeReview = async (req, res) => {

    try {

        console.log("1");

        // get logged in user
        const { userId } = getAuth(req);

        const resume = req.file;

        console.log("USER:", userId);

        // check auth
        if (!userId) {

            return res.json({
                success: false,
                message: "Unauthorized"
            });

        }

        // check file
        if (!resume) {

            return res.json({
                success: false,
                message: "Resume file is required"
            });

        }

        console.log("2");

        // file size check
        if (resume.size > 10 * 1024 * 1024) {

            return res.json({
                success: false,
                message: "Resume file size exceeds allowed size (10MB)"
            });

        }

        console.log("3");

        // read pdf file
        const dataBuffer =
            fs.readFileSync(resume.path);

        console.log("4");

        // load pdf
        const pdf =
            await pdfjsLib.getDocument({
                data: new Uint8Array(dataBuffer)
            }).promise;

        console.log("5");

        // extract text
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {

            const page =
                await pdf.getPage(i);

            const content =
                await page.getTextContent();

            const strings =
                content.items.map(
                    item => item.str
                );

            text += strings.join(" ");
        }

        console.log("6");

        // ai prompt
        const prompt = `
Review the following resume and provide:

1. Strengths
2. Weaknesses
3. Areas for improvement
4. ATS optimization suggestions
5. Overall rating out of 10

Resume:

${text}
`;

        console.log("7");

        // AI response
        const response =
            await AI.chat.completions.create({

                model: "gemini-3-flash-preview",

                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],

                temperature: 0.7,

                max_tokens: 3000

            });

        console.log("8");

        // generated content
        const content =
            response.choices[0].message.content;

        console.log(content);

        // save in database
        await sql`
        INSERT INTO creations
        (user_id, prompt, content, type)

        VALUES
        (
            ${userId},
            'review the uploaded resume',
            ${content},
            'resume-review'
        )
        `;

        console.log("9");

        // send response
        res.json({
            success: true,
            content
        });

    }
    catch (error) {

        console.log("ERROR:");

        console.log(
            error.response?.data ||
            error.message ||
            error
        );

        res.json({
            success: false,
            message: error.message
        });

    }
};