import UserService from '../database/services/user.service'
import bcrypt from 'bcrypt'
import JWT from 'jsonwebtoken'
import User from '../database/models/user.model'
import UploadTableService from "../database/services/uploadTable.service";
import TranscriptionModelService from "../database/services/transcription.service";
import TextService from "../database/services/text.service";
import UploadTable from "../database/models/uploadTable.model";
import Text from "../database/models/text.model";
import TranscriptionModel from "../database/models/transcription.model";
const uploadService = new UploadTableService()
const textModelService = new TextService()
const transcriptService = new TranscriptionModelService()
export const userSignInHandler = async (req, res) => {
    try {
       let body = req.body
       let userObject = await UserService.login(body.email)
        if (userObject === null)
        {
            return res.status(401).json({message : "User doesn't exist"});
        }
       let isAuth = bcrypt.compareSync(body.password, userObject.password)
       let token = await JWT.sign(
           { role: userObject.role, email: body.email },
           process.env.SECRET_KEY
       )
        await UserService.updateToken(token)
        userObject.token = token;
        if (isAuth)
        {
            return res.status(200).json({user: userObject})
        }
        else {
            return res.status(401).json({message: 'Auth wrong'})
        }
    } catch(err) {
        return res.status(500).json({message: err})
    }
}

export const userSignUpHandler = async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    try {
        let body = req.body
        body.password = await bcrypt.hashSync(body.password, 10)
        body.token = await JWT.sign({role: body.role, email: body.email}, process.env.SECRET_KEY)
        let user = await UserService.register(body)
        if (body.upload_id)
        {
            let uploadObj = await UploadTable.findOne({_id: body.upload_id})
            if (uploadObj)
            {
                uploadObj.user_id = user._id;
                uploadObj.user = user._id;
                await  uploadService.updateTable(uploadObj._id, uploadObj)
                let transcriptions = await TranscriptionModel.findOne({upload_id: uploadObj._id})
                if (transcriptions)
                {
                    transcriptions.user_id = uploadObj.user_id
                    await  transcriptService.updateTranscriptionTable(transcriptions._id, transcriptions)
                }
            }
            let textObj =  await Text.findOne({_id: body.upload_id})
            if (textObj)
            {
                textObj.user_id = user._id
               await  textModelService.updateText(textObj._id, textObj)
            }

        }
        return res.status(200).json({user : user})
    } catch(err) {
        if(err.name == 'MongoError') {
            return  res.status(400).json({ message: 'The email address already exist', code: 1 })
        }
        return res.status(500).json({message: err})
    }
}
export const getAllRecords  = async (req, res) => {
    try {
        let data = req.decoded
        if (!data.email)
        {
            return res.status(401).json({message : 'User information not found'})
        }
        let user = await UserService.login(data.email);
        if (!user)
        {
            return res.status(401).json({message : 'User does not exist'})
        }
        let uploads = await  uploadService.getUserUploads(user._id)
        let texts = await  textModelService.getUserTexts(user._id)

        return res.status(200).json({records : {uploads: uploads, texts: texts}})
    } catch(err) {
        if(err.name == 'MongoError') {
            return  res.status(400).json({ message: 'The email address already exist', code: 1 })
        }
        return res.status(500).json({message: err})
    }
}
export const changeRecordStatus  = async (req, res) => {
    try {
        let data = req.decoded
        let body = req.body
        if (!data.email)
        {
            return res.status(401).json({message : 'User information not found'})
        }
        let user = await UserService.login(data.email);
        if (!user)
        {
            return res.status(401).json({message : 'User does not exist'})
        }
        if (body.type ==='upload')
        {
            let uploadObj = await UploadTable.findOne({_id: body.upload_id})
            if (body.contentType ==='contribute')
            {
                uploadObj.contribute_to_science = body.status
            }
            else {
                uploadObj.share = body.status
            }
            await  uploadService.updateTable(uploadObj._id, uploadObj)
        }
        else {
            let textObj =  await Text.findOne({_id: body.upload_id})
            if (body.contentType ==='contribute')
            {
                textObj.contribute_to_science = body.status
            }
            else {
                textObj.share = body.status
            }
            await  textModelService.updateText(textObj._id, textObj)
        }
        return res.status(200).json({result: true})
    } catch(err) {
        if(err.name == 'MongoError') {
            return  res.status(400).json({ message: 'The email address already exist', code: 1 })
        }
        return res.status(500).json({message: err})
    }
}
export const userDeleteHandler = async (req, res) => {
    try {
        let id = req.params.id
        await UserService.delete(id)
        return res.status(200).json()
    } catch(err){
        return res.status(500).json()
    }
}
export const removeRecordsHandler = async (req, res) => {
    try {
        let data = req.decoded
        let body = req.body
        if (!data.email)
        {
            return res.status(401).json({message : 'User information not found'})
        }
        let user = await UserService.login(data.email);
        if (!user)
        {
            return res.status(401).json({message : 'User does not exist'})
        }
        console.log(body.type)
        if (body.type =='upload') {
           await UploadTable.findOneAndDelete({_id: body.upload_id})
        }
        else {
           await Text.findOneAndDelete({_id: body.upload_id})
        }
        return res.status(200).json({result: true})
    } catch(err){
        return res.status(500).json({message: err})
    }
}

export const userUpdateHandler = async (req, res) => {
    try {
        let id = req.params.id
        let userObject = req.body
        await UserService.update(id, userObject)
        return  res.status(200).json({success: true})
    }catch(err) {
        return res.status(500).json({success: false})
    }
}

