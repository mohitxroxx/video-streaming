import { Response, NextFunction } from "express"
import { Requests, VideoUploadRequest, AdminAuthRequest, VideoStreamRequest } from "../utils/def"
import { v4 as uuidv4 } from "uuid"
import formidable from 'formidable';
import { Request } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Video, Admin } from '../models/model';
import { uploadToS3, getSignedStreamUrl, deleteFromS3, getPublicUrl } from '../config/aws';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { Upload } from '@aws-sdk/lib-storage';
import { s3Client, BUCKET_NAME } from '../config/aws';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const adminLogin = async (req: AdminAuthRequest, res: Response) => {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const verifyAdminToken = async (req: Requests, res: Response, next: Function) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const uploadVideo = async (req: VideoUploadRequest, res: Response) => {
    let tempFilePath = '';
    
    try {
        if (!req.files || !req.files.video) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        const videoFile = req.files.video as any;
        const { title, description = '' } = req.body;

        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/x-matroska'];
        if (!allowedTypes.includes(videoFile.mimetype)) {
            return res.status(400).json({ error: 'Invalid video format. Supported formats: MP4, WebM, OGG, AVI, MOV, MKV' });
        }
        
        const fileExtension = path.extname(videoFile.name);
        const uniqueFilename = `${uuidv4()}${fileExtension}`;
        const s3Key = `videos/${uniqueFilename}`;

        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        tempFilePath = path.join(tempDir, uniqueFilename);

        await videoFile.mv(tempFilePath);

        const uploadResult = await uploadToS3(tempFilePath, s3Key, videoFile.mimetype);

        const video = new Video({
            title,
            description,
            filename: uniqueFilename,
            originalName: videoFile.name,
            s3Key,
            s3Url: getPublicUrl(s3Key),
            size: videoFile.size,
            mimeType: videoFile.mimetype,
            uploadedBy: req.user?.username || 'admin'
        });

        await video.save();

        res.json({
            success: true,
            message: 'Video uploaded successfully',
            video: {
                id: video._id,
                title: video.title,
                filename: video.filename,
                size: video.size
            }
        });

    } catch (error) {
        console.error('Video upload error:', error);
        res.status(500).json({ error: 'Failed to upload video' });
    } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
                console.log('Temporary file cleaned up:', tempFilePath);
            } catch (cleanupError) {
                console.error('Error cleaning up temporary file:', cleanupError);
            }
        }
    }
};

export const getVideos = async (req: Request, res: Response) => {
    try {
        const videos = await Video.find({ isPublic: true })
            .select('title description filename size views createdAt thumbnailUrl')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            videos: videos.map(video => ({
                id: video._id,
                title: video.title,
                description: video.description,
                filename: video.filename,
                size: video.size,
                views: video.views,
                thumbnailUrl: video.thumbnailUrl,
            }))
        });
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
};

export const getVideo = async (req: VideoStreamRequest, res: Response) => {
    try {
        const { videoId } = req.params;
        const { range } = req.query;

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        video.views += 1;
        await video.save();

        const signedUrl = await getSignedStreamUrl(video.s3Key);

        res.json({
            success: true,
            video: {
                id: video._id,
                title: video.title,
                description: video.description,
                filename: video.filename,
                size: video.size,
                mimeType: video.mimeType,
                views: video.views,
                streamUrl: signedUrl,
                thumbnailUrl: video.thumbnailUrl
            }
        });
    } catch (error) {
        console.error('Get video error:', error);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
};

export const streamVideo = async (req: VideoStreamRequest, res: Response) => {
    try {
        const { videoId } = req.params;
        const { range } = req.query;

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        if (range && typeof range === 'string') {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : video.size - 1;
            const chunksize = (end - start) + 1;

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${video.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': video.mimeType,
            });
        } else {
            res.writeHead(200, {
                'Content-Length': video.size,
                'Content-Type': video.mimeType,
            });
        }

        const signedUrl = await getSignedStreamUrl(video.s3Key);
        res.redirect(signedUrl);

    } catch (error) {
        console.error('Stream video error:', error);
        res.status(500).json({ error: 'Failed to stream video' });
    }
};

export const getAllVideos = async (req: Request, res: Response) => {
    try {
        const videos = await Video.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            videos: videos.map(video => ({
                id: video._id,
                title: video.title,
                description: video.description,
                filename: video.filename,
                size: video.size,
                views: video.views,
                isPublic: video.isPublic,
                uploadedBy: video.uploadedBy
            }))
        });
    } catch (error) {
        console.error('Get all videos error:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
};

export const deleteVideo = async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        await deleteFromS3(video.s3Key);

        await Video.findByIdAndDelete(videoId);

        res.json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
};

export const toggleVideoVisibility = async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        video.isPublic = !video.isPublic;
        await video.save();

        res.json({
            success: true,
            message: `Video ${video.isPublic ? 'published' : 'unpublished'} successfully`,
            isPublic: video.isPublic
        });
    } catch (error) {
        console.error('Toggle video visibility error:', error);
        res.status(500).json({ error: 'Failed to update video visibility' });
    }
};

export const createAdmin = async (req: Request, res: Response) => {
    try {
        const { username, password, email } = req.body;

        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin with this username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new Admin({
            username,
            password: hashedPassword,
            email: email || `${username}@streaming.com`,
            role: 'admin'
        });

        await admin.save();

        res.json({
            success: true,
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
};

export const bulkUpload = async (req: Requests, res: Response) => {
    try {
        if (!req.files || !req.files.videos) {
            return res.status(400).json({ error: 'No video files uploaded' });
        }
        let files = req.files.videos;
        if (!Array.isArray(files)) files = [files];
        const results = [];
        for (const file of files) {
            const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/x-matroska'];
            if (!allowedTypes.includes(file.mimetype)) {
                results.push({ name: file.name, error: 'Invalid video format' });
                continue;
            }
            const fileExtension = path.extname(file.name);
            const baseName = path.basename(file.name, fileExtension);
            const uniqueFilename = `${uuidv4()}${fileExtension}`;
            const s3Key = `videos/${uniqueFilename}`;
            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const tempFilePath = path.join(tempDir, uniqueFilename);
            await file.mv(tempFilePath);
            const params = {
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: fs.createReadStream(tempFilePath),
                ContentType: file.mimetype,
            };
            const queueSize = 4;
            const partSize = 10 * 1024 * 1024;
            let lastProgress = 0;
            const parallelUploads3 = new Upload({
                client: s3Client,
                params,
                queueSize,
                partSize,
                leavePartsOnError: false,
            });
            const startTime = Date.now();
            parallelUploads3.on('httpUploadProgress', (progress) => {
                if (progress.total) {
                    const percentage = ((progress.loaded / progress.total) * 100).toFixed(2);
                    lastProgress = parseFloat(percentage);
                }
            });
            try {
                await parallelUploads3.done();
                const video = new Video({
                    title: baseName,
                    description: '',
                    filename: uniqueFilename,
                    originalName: file.name,
                    s3Key,
                    s3Url: getPublicUrl(s3Key),
                    size: file.size,
                    mimeType: file.mimetype,
                    uploadedBy: req.user?.username || 'admin',
                });
                await video.save();
                results.push({ name: file.name, status: 'success', progress: lastProgress });
            } catch (err) {
                results.push({ name: file.name, error: err.message, progress: lastProgress });
            } finally {
                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            }
        }
        res.json({ success: true, results });
    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({ error: 'Bulk upload failed' });
    }
};