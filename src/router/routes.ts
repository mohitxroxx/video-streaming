import { Router } from "express";
import ctrl from '../controllers/controllers'
const app: Router = Router();


app.get('/upload',ctrl.uploadFile)

export default app