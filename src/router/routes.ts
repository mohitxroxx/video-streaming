import { Router } from "express";
import ctrl from '../controllers/controllers'
const app: Router = Router();


app.post('/upload',ctrl.uploadFile)

export default app