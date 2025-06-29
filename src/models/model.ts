import { Schema, model } from "mongoose";

export interface IVideo {
    title: string;
    description: string;
    filename: string;
    originalName: string;
    s3Key: string;
    s3Url: string;
    duration: number;
    size: number;
    mimeType: string;
    thumbnailUrl?: string;
    uploadedBy: string;
    isPublic: boolean;
    views: number;
}

export interface IAdmin {
    username: string;
    password: string;
    email: string;
    role: string;
}

const VideoSchema = new Schema<IVideo>({
    title: {
        type: String,
        required: true,
        trim: true 
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    s3Key: {
        type: String,
        required: true
    },
    s3Url: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        default: 0
    },
    size: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    uploadedBy: {
        type: String,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const AdminSchema = new Schema<IAdmin>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
        type: String,
        default: "admin"
    }
}, { timestamps: true });

export const Video = model<IVideo>("Video", VideoSchema);
export const Admin = model<IAdmin>("Admin", AdminSchema);
