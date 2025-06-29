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
    createAdmin
} from '../controllers/controllers';

const router = express.Router();

router.post('/admin/login', adminLogin);
// router.post('/admin/create', createAdmin);

router.post('/admin/upload', verifyAdminToken, uploadVideo);
router.get('/admin/videos', verifyAdminToken, getAllVideos);
router.delete('/admin/videos/:videoId', verifyAdminToken, deleteVideo);
router.patch('/admin/videos/:videoId/toggle', verifyAdminToken, toggleVideoVisibility);

router.get('/videos', getVideos);
router.get('/videos/:videoId', getVideo);
router.get('/stream/:videoId', streamVideo);

export default router;