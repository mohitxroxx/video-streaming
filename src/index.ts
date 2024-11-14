import express, { Response } from 'express'
import routes from './router/routes'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import connectRedis from 'connect-redis'
// import redisClient from './config/redis'
import { Requests } from './utils/def'


// const RedisStore = new connectRedis({
//     client: redisClient,
//     prefix: "myapp"
// })

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())

// app.use(session({
//     store: RedisStore,
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: true,
// }))
app.use('/api', routes)
app.get('/views', (req: Requests, res: Response) => {
    if (req.session.views) {
        req.session.views++
    } else {
        req.session.views = 1
    }
    return res.status(201).json({ "Views": req.session.views })
})

app.get('/', (req: Requests, res: Response): Response => {
    return res.status(201).json({ msg: "Server is Live!!!🚀" })
})


const port: number = Number(process.env.PORT) || 5000

app.listen(port, () => {
    console.log(`Server is up and Running at http://localhost:${port}`)
})
