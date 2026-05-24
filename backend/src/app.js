//app.js
import express from 'express';
import cors from 'cors';
// Source - https://stackoverflow.com/a/79875907
// Posted by Sudarsan Sarkar, modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-23, License - CC BY-SA 4.0
import apiRoutes from './routes/index.js';
import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "1.0.0.1"]);

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())   
app.use(express.urlencoded({extended: true, limit:"16kb"}))
// app.js mein static line ko aise likho
app.use(express.static("./dist"));

app.use("/api", apiRoutes);

export {app}