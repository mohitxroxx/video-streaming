import { Schema, model } from "mongoose";

export interface IFile {
    name: string,
    link: string
}

const FileSchema = new Schema<IFile>({
    name: {
        type: String,
        trim: true 
    },
    link : {
        type: String,
        trim: true
    },
}, { timestamps:true });


export default model<IFile>("File", FileSchema);
