import { Response } from "express"
import {Requests} from "../utils/def"


const uploadFile = async (req: Requests, res: Response) => {
    try {
        return res.status(200).json({ msg: 'Sample route' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Error occured while fetching data' })
    }
}

const all_exports = {
    uploadFile
}

export default all_exports

