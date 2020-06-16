import express from 'express'
import ExpressJwt from 'express-jwt'
import * as handlers from '../handlers/conversion.handler'

const router = express.Router()
router.use(express.json())
router.use(ExpressJwt({ secret: process.env.SECRET_KEY }))

router.post('/convert', handlers.convertVideoToMp4)

export default router

