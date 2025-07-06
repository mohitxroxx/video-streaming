import express, { Response } from 'express'
import routes from './router/routes'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Requests } from './utils/def'
import fileUpload from "express-fileupload"
import connectDB from './config/db'
import * as path from 'path'

const app = express()
connectDB()

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../public')))

app.use('/api',fileUpload(), routes)


app.get('/', (req: express.Request, res: Response) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Video Streaming Platform</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    text-align: center;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 40px;
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    margin-bottom: 30px;
                    font-size: 2.5em;
                }
                .buttons {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .btn {
                    padding: 15px 30px;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    text-decoration: none;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                }
                .btn-admin {
                    background: #ff6b6b;
                    color: white;
                }
                .btn-user {
                    background: #4ecdc4;
                    color: white;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎬 Video Streaming Platform API</h1>
                <p>Welcome to our high-performance video streaming service</p>
            </div>
        </body>
        </html>
    `)
})

const port: number = Number(process.env.PORT) || 5000

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})
