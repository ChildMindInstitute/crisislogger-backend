import express from 'express'
import ExpressJwt from 'express-jwt'
import * as handlers from '../handlers/file.handlers'

const router = express.Router()
router.use(express.json())
router.use(ExpressJwt({ secret: process.env.SECRET_KEY }))

router.post('/upload', handlers.uploadFileHandle)
router.post('/conversion_finished', handlers.uploadFileHandle)

router.post('/text', handlers.uploadTextHandle)
export default router

