import UserService from '../database/services/user.service'
import bcrypt from 'bcrypt'
import JWT from 'jsonwebtoken'
import UploadTableService from "../database/services/uploadTable.service";
import TranscriptionModelService from "../database/services/transcription.service";
import QuestionnaireService from '../database/services/questionnary.service';
import TextService from "../database/services/text.service";
import UploadTable from "../database/models/uploadTable.model";
import Text from "../database/models/text.model";
import TranscriptionModel from "../database/models/transcription.model";
const uploadService = new UploadTableService()
const textModelService = new TextService()
const transcriptService = new TranscriptionModelService()
const questionnaryService = new QuestionnaireService()

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
            return res.status(401).json({message: 'Email or password is invalid'})
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
            let options = {user_id: user._id}
            let uploadObj = await UploadTable.findOne({_id: body.upload_id})
            if (uploadObj)
            {
                await  uploadService.updateTable(uploadObj._id, options)
                let transcriptions = await TranscriptionModel.findOne({upload_id: uploadObj._id})
                if (transcriptions)
                {
                    await  transcriptService.updateTranscriptionTable(transcriptions._id, options)
                }
            }
            let textObj =  await Text.findOne({_id: body.upload_id})
            if (textObj)
            {
                let options = {user_id: user._id}
               await  textModelService.updateText(textObj._id, options)
            }

        }
        let questionnaireRequired = false;
        if (body.where_from === process.env.MAINDOMAIN || !user.referral_code.length )
        {
            questionnaireRequired = true
        }
        return res.status(200).json({user : user, questionnaireRequired: questionnaireRequired})
    } catch(err) {
        if(err.name == 'MongoError') {
            return  res.status(400).json({ message: 'The email address already exist', code: 1 })
        }
        return res.status(500).json({message: err})
    }
}
export const getAllRecords  = async (req, res) => {
    try {
        let user;
        if (req.user && req.user.email) {
            user = await UserService.login(req.user.email)
        }
        else {
            return res.status(401).json({message : 'User information not found'})
        }
        if (!user)
        {
            return res.status(401).json({message : 'User does not exist'})
        }
        let where_from = req.headers.origin.split('//')[1];
        let uploads = await  uploadService.getUserUploads(user._id, where_from)
        let texts = await  textModelService.getUserTexts(user._id, where_from)

        return res.status(200).json({records : {uploads: uploads, texts: texts}})
    } catch(err) {
        return res.status(500).json({message: err})
    }
}
export const changeRecordStatus  = async (req, res) => {
    try {
        let user;
        let body = req.body
        if (!req.user || ! req.user.email)
        {
            return res.status(401).json({message : 'User information not found'})
        }
        if (req.user && req.user.email) {
            user = await UserService.login(req.user.email)
        }
        if (!user)
        {
            return res.status(401).json({message : 'User does not exist'})
        }
        if (body.type ==='upload')
        {
            let uploadObj = await UploadTable.findOne({_id: body.upload_id})
            if (body.contentType ==='contribute')
            {
                uploadObj.contribute_to_science = !!body.status
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
                textObj.contribute_to_science = !!body.status
            }
            else {
                textObj.share = body.status
            }
            await  textModelService.updateText(textObj._id, textObj)
        }
        return res.status(200).json({result: true})
    } catch(err) {
        if(err.name == 'MongoError') {
            return  res.status(400).json({ message: err, code: 1 })
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
        let body = req.body
        if (!req.user || !req.user.email)
        {
            return res.status(401).json({message : 'User information not found'})
        }
        let user = await UserService.login(req.user.email);
        if (!user)
        {
            return res.status(401).json({message : 'User does not exist'})
        }
        if (body.type === 'upload') {
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
        if (req.user && req.user.email)
        {
            let user = await UserService.getUserIdByEmail(req.user.email)
            let token = await JWT.sign(
                { role: user.role, email: user.email },
                process.env.SECRET_KEY
            )
            user.email  = req.body.email
            user.name  = req.body.name
            user.token  = token
            await UserService.update(user._id, user)
            return  res.status(200).json({result: user})
        }
        else {
            return res.status(401).json({message : 'Unauthorized'})
        }
    }catch(err) {
        console.log(err)
        return res.status(500).json({success: false})
    }
}

export const getAccount = async (req, res) => {
    try {
        if (req.user && req.user.email)
        {
            let user = await UserService.getUserIdByEmail(req.user.email)
            return  res.status(200).json({result : user})
        }
        else {
            return res.status(401).json({message : 'Unauthorized'})
        }

    } catch(err) {
        console.log(err)
        return res.status(200).json({message: err})
    }
}
export  const changePassword = async (req, res) => {
    try {
        if (req.user && req.user.email)
        {
            let body = req.body;
            let user = await UserService.getUserIdByEmail(req.user.email)
            let isAuth = bcrypt.compareSync(body.old_password, user.password)
            if(isAuth) {
                body.new_password = await bcrypt.hashSync(body.new_password, 10)
                body.token = await JWT.sign({role: user.role, email: user.email}, process.env.SECRET_KEY)
                user.token = body.token;
                user.password = body.new_password;
                await UserService.update(user._id, user)
                return res.status(200).json({result: user})
            }
            else {
                return res.status(200).json({message: 'Old password is invalid'})
            }
        }
        else {
            return res.status(401).json({message : 'Unauthorized'})
        }

    } catch(err) {
        return res.status(200).json({message: err})
    }
}
export const saveUserQuestionnaire = async (req, res) => {
    try {
        if (req.user && req.user.email)
        {
            const user = await UserService.getUserIdByEmail(req.user.email)
            const userId = user._id
            await questionnaryService.createDBObject(userId, req.body.questionnaireData)
        }
        else {
            return res.status(401).json({message : 'Unauthorized'})
        }
        return res.status(200).json({message: 'Successfully updated'})
    } catch(err) {
        return res.status(200).json({message: err})
    }
}
