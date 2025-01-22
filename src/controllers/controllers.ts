import { Response, NextFunction } from "express"
import { Requests } from "../utils/def"
import { putObject } from "../utils/putObject"
import { v4 } from "uuid"
import formidable from 'formidable';


const uploadFile = async (req: Requests, res: Response, next: NextFunction) => {
    try {
        const {myfiles} = req.files;
        const fileName = "images/"+v4()
        const result = await putObject(myfiles.data, fileName);

        if (!result || !result.url || !result.key) {
            return res.status(400).json({
                "status": result,
                "data": "Image is not uploaded",
            });
        }

        const {url, key} = result;

        return res.status(201).json({
            "status": "success",
            "data": url,
        })
    } catch (err) {
        console.error(err);
    }
}

const all_exports = {
    uploadFile
}

export default all_exports

