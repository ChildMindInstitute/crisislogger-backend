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
import { text } from 'body-parser';
const uploadService = new UploadTableService()
const textModelService = new TextService()
const transcriptService = new TranscriptionModelService()
const questionnaryService = new QuestionnaireService()

export const userSignInHandler = async (req, res) => {
    try {
        let body = req.body
        let host = req.headers.origin.split('//')[1];
        let userObject = await UserService.login(body.email, host)
        if (userObject === null)
        {
            return res.status(401).json({message : "User doesn't exist or not authorized to login here"});
        }
       let isAuth = bcrypt.compareSync(body.password, userObject.password)
       let token = await JWT.sign(
           { role: userObject.role, email: userObject.email,host:userObject.host },
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
        console.log(err)
        return res.status(500).json({message: err})
    }
}

export const userSignUpHandler = async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    try {
        let body = req.body
        body.host = req.headers.origin.split('//')[1]
        body.token = await JWT.sign({role: body.role, email: body.email, host:body.host}, process.env.SECRET_KEY)
        let userObject = await UserService.login(body.email, body.host)
        if (userObject !== null)
        {
            return res.status(400).json({message : "Email address already exist"});
        }
        let user = await UserService.register(body)
        if (body.upload_id)
        {
            let options = {user_id: user._id,user:user._id}
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
        console.log(err)
        if(err.name == 'MongoError') {
            return  res.status(400).json({ message: 'Something went wrong, please try again later.', code: 1 })
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
        let options;
        if (body.type ==='upload')
        {
            let uploadObj = await UploadTable.findOne({_id: body.upload_id})
            if (body.contentType ==='contribute')
            {
                options = {
                    contribute_to_science: !!body.status
                }
            }
            else {
                options =  {
                    share : body.status
                }
            }
            await  uploadService.updateTable(uploadObj._id, options)
        }
        else {
            let textObj =  await Text.findOne({_id: body.upload_id})
            if (body.contentType ==='contribute')
            {
                options = {
                    contribute_to_science : !!body.status
                }
            }
            else {
                options = {
                    share: body.status
                }
            }
            await  textModelService.updateText(textObj._id, options)
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

            if (!user)
            {
                return res.status(401).json({message : 'Unauthorized'})
            }
            let token = await JWT.sign(
                { role: user.role, email: req.body.email },
                process.env.SECRET_KEY
            )
            await UserService.delete(user._id)
            let userObject = await UserService.login(req.body.email)
            if (userObject !== null)
            {
                return res.status(400).json({message : "Email address already exist"});
            }
            const userObj = {
                email: req.body.email,
                name: req.body.name,
                token: token,
                role: user.role,
                referral_code: user.referral_code,
                _id: user._id,
                password: user.password,
                country: user.country
            }
            let createdUser = await UserService.register(userObj)
            return  res.status(200).json({result: createdUser})
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
            if (user)
            {
                return  res.status(200).json({result : user})
            }
            else {
                return  res.status(401).json({result : null})
            }
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
                const obj =  {
                    token:  body.token,
                    password: body.new_password
                }
                await UserService.update(user._id, obj)
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
export const closeMyAccount = async (req, res) => {
    try {
        if (req.user && req.user.email)
        {
            const user = await UserService.getUserIdByEmail(req.user.email)
            if (!user)
            {
                return res.status(401).json({message : 'Unauthorized'})
            }
            await UserService.delete(user._id);
        }
        else {
            return res.status(401).json({message : 'Unauthorized'})
        }
        return res.status(200).json({message: 'Successfully updated'})
    } catch(err) {
        return res.status(200).json({message: err})
    }
}
export const getUploadId = async(req,res)=>{
    try {
        let id = req.params.id
        let result = await uploadService.getUploadById(id)
        if(result){
            if(result.user){
                result["user"] = {_id:result.user._id,name:result.user.name,email:result.user.email}            
            }
            return res.status(200).json({data:result})
        }
        return res.status(401).json({message:"Not found"})
    } catch(err) {
        return res.status(200).json({message: err})
    }
}
export const getUploadsByIds = async(req,res)=>{
    try {
        let ids = req.query.ids.split(",")
        let result = await uploadService.getUploadsByIds(ids)
        if(result){
            for (let index = 0; index<result.length;index++){
                if(result[index].user){
                    result[index].user ={
                         _id:result[index].user._id,name:result[index].user.name,email:result[index].user.email
                    }
                }
            }
            return res.status(200).json({data:result})
        }
        return res.status(401).json({message:"Not found"})
    } catch(err) {
        return res.status(200).json({message: err})
    }
}
export const getTextById = async(req,res)=>{
    try {
        let id = req.params.id
        let result = await textModelService.getTextWithId(id)

        if(result){
            if(result.user_id){
                result=result.toObject()
                result["user"]={_id:result.user_id._id,name:result.user_id.name,email:result.user_id.email}
                delete result.user_id
            }
            return res.status(200).json({data:result})
        }
        return res.status(401).json({message:"Not found"})
    } catch(err) {
        return res.status(200).json({message: err})
    }
}
export const getTextByIds = async(req,res)=>{
    try {
        let ids = req.query.ids.split(",")
        let result = await textModelService.getTextsWithId(ids)
        if(result){
            for (let index = 0; index<result.length;index++){
                if(result[index].user_id){
                    result[index]["user_id"] ={
                        _id:result[index].user_id._id,name:result[index].user_id.name,email:result[index].user_id.email
                    }
                }
            }
            return res.status(200).json({data:result})
        }
        return res.status(401).json({message:"Not found"})
    } catch(err) {
        return res.status(200).json({message: err})
    }
}
export const updateApproveStatus = async(req,res)=>{
    try {
        let found = false
        let id = req.params.id
        let result = await uploadService.getUploadById(id)
        if(!result){
            result = await textModelService.getTextWithId(id)
            if(result){
                found =true
                result = await textModelService.updateApproveStatus(id, result.approved)
            }
        }else{
            found = true
            result = await uploadService.updateApproveStatus(id, result.approved)
            // update the upload
        }
        if(result){
            return res.status(200).json({data:result})
        }
        return res.status(401).json({message:"Not found"})
    } catch(err) {
        return res.status(200).json({message: err})
    }
}
export const updatePublishStatus = async(req,res)=>{
    try {
        let id = req.params.id
        let result = await uploadService.getUploadById(id)
        if(!result){
            result = await textModelService.getTextWithId(id)
        }else{
            result = await uploadService.updatePublishStatus(id,result.published)
        }
        if(result){
            return res.status(200).json({data:result})
        }
        return res.status(401).json({message:"Not found"})
    } catch(err) {
        return res.status(200).json({message: err})
    }
}

export const getAllUsersRecords = async(req,res)=>{

    try {
        let {usersIncluded,usersExcluded,dateStart,dateEnd,searchText,refferalCode,domain} = req.query
        let idsIncluded =[]
        let idsExluded= []
        let referralIds = []
        let filter={}
        if(refferalCode !== undefined && refferalCode.length>0){
            referralIds = await UserService.getUserIdsFromRefferals(refferalCode.split(","))
            idsIncluded = [...idsIncluded,...referralIds]
        }
        if(usersIncluded !== undefined && usersIncluded.length>0){

            let ids  = await UserService.getUsersIdsLikeEmails(usersIncluded.split(","))
            idsIncluded = [...idsIncluded,...ids]
        }
        
        if(idsIncluded.length>0){
            filter ={
                $and:[
                    {user_id:{$in:idsIncluded}}
                ]
            }
        }
        
        if(domain!==undefined){
            if(filter["$and"] !== undefined){
                filter["$and"] =[
                    ...filter["$and"],
                    {where_from:domain}
                ]
            }else{
                filter["$and"]=[
                    {where_from:domain}
                ]
            }
        }
        if(usersExcluded !== undefined && usersExcluded.length>0){
            idsExluded = await UserService.getUsersIdsLikeEmails(usersExcluded.split(","))
            if(idsExluded.length>0){
                if(filter["$and"] !== undefined){
                    filter["$and"]=[
                        ...filter["$and"],
                        {user_id:{$nin:idsExluded}}
                    ]
                }else{
                    filter["$and"]=[
                        {user_id:{$nin:idsExluded}}
                    ]
                }
            }
            
        }
        if(dateStart !==undefined && dateEnd !== undefined){
            if(filter["$and"] !== undefined){
                filter["$and"]=[
                    ...filter["$and"],
                    {created_at:{
                        $gte:dateStart,
                        $lte:dateEnd
                    }}
                ]
            }else{
                filter["$and"]=[
                    {created_at:{
                        $gte:dateStart,
                        $lte:dateEnd
                    }}
                ]
            }
        }else if(dateStart !== undefined){
            if(filter["$and"] !== undefined){
                filter["$and"]=[
                    ...filter["$and"],
                    {created_at:{
                        $gte:dateStart,
                    }}
                ]
            }else{
                filter["$and"]=[
                    {created_at:{
                        $gte:dateStart,
                    }}
                ]
            }
        }else if(dateEnd !== undefined){
            if(filter["$and"]!== undefined){
                filter["$and"]=[
                    ...filter["$and"],
                    {created_at:{
                        $lte:dateEnd,
                    }}
                ]
            }else{
                filter["$and"]=[
                    {created_at:{
                        $lte:dateEnd,
                    }}
                ]
            }
        }
        let textIdsToFilter=[]
        textIdsToFilter =[ ... await (await uploadService.getUploadsContainingText(text)).map(el=>el._id)]
        textIdsToFilter =[...textIdsToFilter, ...await (await textModelService.findTextUploadWithText(searchText)).map(el=>el._id)]
        if(textIdsToFilter.length>0){
            if(filter["$and"] !== undefined){
                filter["$and"]=[...filter["$and"],{_id:{"$in":textIdsToFilter}}]
            }else{
                filter["$and"]=[{_id:{"$in":textIdsToFilter}}]
            }
        }
        
        
        let uploads = await uploadService.getUploadsWithFilter(filter)
        let texts = await textModelService.getTextWithFilter(filter)
        let combineData = [...uploads,...texts]
        combineData.sort(function(a,b){
            let date1 = new Date(a.created_at)
            let date2 = new Date(b.created_at)
            return date2 - date1
        })
        let dataByDate = {}
        combineData.forEach(el=>{
            let date = new Date(el.created_at).toLocaleDateString()
            if(dataByDate[date] === undefined){
                dataByDate[date] = [el]
            }else {
                dataByDate[date] =[...dataByDate[date],el]
            }
        })
        return res.status(200).json({
            records:Object.values(dataByDate),
            filter
        })
    } catch(err) {
        return res.status(500).json({message: err})
    }
}
