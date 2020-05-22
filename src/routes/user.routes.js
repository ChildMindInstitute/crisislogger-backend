import express from 'express'
import ExpressJwt from 'express-jwt'
import * as handlers from '../handlers/user.handlers'

const router = express.Router()


router.use(express.json())
router.use(ExpressJwt({ secret: process.env.SECRET_KEY }).unless({
    path: ['/users/signin', '/users/signup']
}))

router.all('/*', (req, res, next) => {
    let now = new Date();
    let houre = now.getHours();
    let minuts = now.getMinutes();
    let second = now.getSeconds();
    console.log(`${houre}:${minuts}:${second} Metod: ${req.method} : ${req.path} `)
    next()
})

router.post('/signin', handlers.userSignInHandler)

router.post('/signup', handlers.userSignUpHandler)

router.delete('/:id', handlers.userDeleteHandler)

router.put('/:id', handlers.userUpdateHandler)

export default router