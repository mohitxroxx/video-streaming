import { Response } from "express"
import {Requests} from "../utils/def"
import redisClient from "../config/redis"
import axios from 'axios'
import UserSchema from '../models/model'


const genTokens = async(userId:string) =>{
    try {
        const user = await UserSchema.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        return false
    }
}

const hello = async (req: Requests, res: Response) => {
    try {
        const cachedData = await redisClient.get('cachedData')
        if (cachedData) {
            return res.status(200).json(`Cached Data: ${cachedData}`)
        } else {
            const response= await axios.get('https://jsonplaceholder.typicode.com/users')
            console.log(response.data)
            const responseData = JSON.stringify(response.data)
            await redisClient.set('cachedData', responseData)
            return res.status(200).json({responseData})
        }
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'Internal Server Error', details: err.message })
    }
}
const hehe = async (req: Requests, res: Response) => {
    try {
        return res.status(200).json({ msg: 'hehe' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Error occured while fetching data' })
    }
}

const all_exports = {
    hello,
    hehe
}

export default all_exports

