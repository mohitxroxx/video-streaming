import express, { Response } from 'express'
import routes from './router/routes'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Requests } from './utils/def'


const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())

app.use('/api', routes)


app.get('/', (req: Requests, res: Response): Response => {
    return res.status(201).json({ msg: "Server is Live!!!🚀" })
})


const port: number = Number(process.env.PORT) || 5000

app.listen(port, () => {
    console.log(`Server is up and Running at http://localhost:${port}`)
})
