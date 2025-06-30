import express from 'express';
import {
    adminLogin,
    verifyAdminToken,
    uploadVideo,
    getVideos,
    getVideo,
    streamVideo,
    getAllVideos,
    deleteVideo,
    toggleVideoVisibility,
    createAdmin,
    bulkUpload
} from '../controllers/controllers';

const router = express.Router();

router.post('/admin/login', adminLogin as express.RequestHandler);
router.post('/admin/create', createAdmin as express.RequestHandler);

router.post('/admin/upload', verifyAdminToken as express.RequestHandler, uploadVideo as express.RequestHandler);
router.post('/admin/bulk-upload', verifyAdminToken as express.RequestHandler, bulkUpload as express.RequestHandler);
router.get('/admin/videos', verifyAdminToken as express.RequestHandler, getAllVideos as express.RequestHandler);
router.delete('/admin/videos/:videoId', verifyAdminToken as express.RequestHandler, deleteVideo as express.RequestHandler);
router.patch('/admin/videos/:videoId/toggle', verifyAdminToken as express.RequestHandler, toggleVideoVisibility as express.RequestHandler);

router.get('/videos', getVideos as express.RequestHandler);
router.get('/videos/:videoId', getVideo as express.RequestHandler);
router.get('/stream/:videoId', streamVideo as express.RequestHandler);

export default router;