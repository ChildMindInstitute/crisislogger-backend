import UserService from '../database/services/user.service'
import bcrypt from 'bcrypt'
import JWT from 'jsonwebtoken'
import User from '../database/models/user.model'

export const userSignInHandler = async (req, res) => {
    try {
       let body = req.body
       let userObject = await UserService.login(body.email)
       let isAuth = bcrypt.compareSync(body.password, userObject.password)
       let token = await JWT.sign(
           {role: userObject.role, userObject: body.email},
           process.env.SECRET_KEY,
           { expiresIn: 60 * 60 }
       )
       UserService.updateToken(token)
       isAuth ? res.status(200).json(token): res.status(401).send('Auth wrong')
    } catch(err) {
        res.status(500).send(err)
    }
}

export const userSignUpHandler = async (req, res) => {
    try {
        let body = req.body
        body.password = await bcrypt.hashSync(body.password, 10)
        body.token = await JWT.sign({role: body.role, email: body.email}, process.env.SECRET_KEY, { expiresIn: 60 * 60 })
        await UserService.register(body)
        res.status(200).send(body.token)
    } catch(err) {
        if(err.name == 'MongoError') {
            res.status(400).send({ msg: 'Duplicate email', code: 1 })
        }
        res.status(500).send(err)
    }
}

export const userDeleteHandler = async (req, res) => {
    try {
        let id = req.params.id
        await UserService.delete(id)
        res.status(200).send()
    } catch(err){
        res.status(500).send()
    }
}

export const userUpdateHandler = async (req, res) => {
    try {
        let id = req.params.id
        let userObject = req.body
        await UserService.update(id, userObject)
        res.status(200).send()
    }catch(err) {
        res.status(500).send()
    }
}

