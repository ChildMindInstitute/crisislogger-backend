import express from 'express'
import * as handlers from '../handlers/conversion.handler'

const router = express.Router()
router.use(express.json())

router.post('/video', handlers.convertVideoToMp4)
router.post('/webhook', handlers.webhook)

export default router

