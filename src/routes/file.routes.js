import express from 'express'
import * as handlers from '../handlers/file.handlers'

const router = express.Router()
router.use(express.json())

router.post('/upload', handlers.uploadFileHandle)

export default router

