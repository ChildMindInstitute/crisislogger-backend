import express from 'express'
import ExpressJwt from 'express-jwt'
import * as handlers from '../handlers/user.handlers'
import {checkToken} from '../middleware/middleware'
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
    console.log(`${houre}:${minuts}:${second} Method: ${req.method} : ${req.path} `)
    next()
})
router.post('/signin', handlers.userSignInHandler)
router.post('/signup', handlers.userSignUpHandler)
router.post('/removeAccount', handlers.closeMyAccount)
router.delete('/:id', handlers.userDeleteHandler)
router.put('/change-password', checkToken, handlers.changePassword)
router.put('/update-profile', checkToken, handlers.userUpdateHandler)
router.get('/me', checkToken, handlers.getAccount)
router.get('/getrecords' ,checkToken,  handlers.getAllRecords)
router.post('/changeRecordStatus' ,checkToken,  handlers.changeRecordStatus)
router.post('/removeRecords' ,checkToken,  handlers.removeRecordsHandler)
router.post('/questionnaire', handlers.saveUserQuestionnaire);
export default router