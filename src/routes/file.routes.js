import express from 'express'
import ExpressJwt from 'express-jwt'
import * as handlers from '../handlers/file.handlers'
import {checkToken,checkAdmin} from '../middleware/middleware'
const router = express.Router()
router.use(express.json())

router.post('/upload', handlers.uploadFileHandle)
router.post('/conversion_finished', handlers.uploadFileHandle)
router.get('/transcriptions', handlers.getGalleryData)
router.post('/text', handlers.uploadTextHandle)
router.post('/webhook', handlers.webhook)
router.get('/downloadCsv',[checkToken,checkAdmin], handlers.downloadCsvData)
export default router

