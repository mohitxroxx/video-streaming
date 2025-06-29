import { Request, Response } from 'express'

declare module 'express-session' {
    interface SessionData {
        views: number
    }
}

export interface Requests extends Request {
    user?: any
    session: any
    files?: any
}

export interface VideoUploadRequest extends Requests {
    file?: any
    body: {
        title: string
        description?: string
    }
}

export interface AdminAuthRequest extends Requests {
    body: {
        username: string
        password: string
    }
}

export interface VideoStreamRequest extends Requests {
    params: {
        videoId: string
    }
    query: {
        range?: string
    }
}
