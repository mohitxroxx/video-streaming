import express, { Response } from 'express'
import routes from './router/routes'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Requests } from './utils/def'
import fileUpload from "express-fileupload"

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())

app.use('/api',fileUpload(), routes)


app.get('/', (req: Requests, res: Response) => {
    res.send(`
        <form action="/api/upload" enctype="multipart/form-data" method="post">
          <div>Text field title: <input type="text" name="title" /></div>
          <div>File: <input type="file" name="myfiles" multiple="multiple" /></div>
          <input type="submit" value="Upload" />
        </form>
      `);
})


const port: number = Number(process.env.PORT) || 5000

app.listen(port, () => {
    console.log(`Server is up and Running at http://localhost:${port}`)
})
