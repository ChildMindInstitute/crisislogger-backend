import User from "./src/database/models/user.model";
import Text from "./src/database/models/text.model";
import UploadTable from "./src/database/models/uploadTable.model";
import TranscriptionModel from "./src/database/models/transcription.model";
import Questionnaire from "./src/database/models/questionnary.model";
import data from './data.json'
export default async function  migrateDb  (){
  console.log('migrating')
  let users = data['users'].map(async user=>{
    user['role'] = (user.is_admin===1)?2:1;
    user['sqlId'] = user.id;
    try {
      let obj  =  new User(user);
      let newObj = await obj.save();
      return newObj;
    }catch (err){
      return null
    }
  })
  Promise.all(users).then(users=>{
    users.forEach(user=>{
      // [add texts with userIds]
      data['texts'].filter(text=>text.user_id == user.sqlId).forEach(async text=>{
        text['user_id'] = user._id;
        text['sqlId'] = text.id;
        text['approved']= text.hide == null ? false: !text.hide;
        text['where_from']= text.where_from? text.where_from.split("//")[1]: 'crisislogger.org';
        await User.findOneAndUpdate({_id: user._id}, {$set: {where_from: text['where_from']}}, {useFindAndModify: false, new: true,  returnOriginal: false})
        await (new Text(text)).save();
      })
      // [add uploads]
      data['uploads'].filter(upload=>upload.user_id == user.sqlId).forEach( upload=>{
        upload['user_id'] = user._id;
        upload['sqlId'] = upload.id;
        upload['original_name']= upload.original_file_name;
        upload['approved']= upload.hide == null ? false: !upload.hide;
        upload['published']= upload.published;
        upload['transcript_rate']= upload.rating;
        upload['where_from']= upload.where_from? upload.where_from.split("//")[1]: 'crisislogger.org';
        console.log(upload)
        (new UploadTable(upload)).save().then(async upload=>{
          // [add transcriptions with user
          await User.findOneAndUpdate({_id: user._id}, {$set: {where_from: upload['where_from']}}, {useFindAndModify: false, new: true,  returnOriginal: false})
          await addUploadTranscription(upload,user)
        });
      })
      // [add questionnaire's]
      data['questions'].filter(question=>question.user_id == user.sqlId).forEach(async question=>{
        question['user_id'] = user._id;
        question['questionnaireData'] = {fields:question.fields};
        (new Questionnaire(question)).save();
      })
    })
  }).catch(error=>{
    return null
    console.log("Migration Failed=>",error)
  })
  // [add texts without userIds]
  data['texts'].filter(text=>text.user_id == undefined || text.user_id == null).forEach(text=>{
    text['sqlId'] = text.sqlId;
    text['where_from']= text.where_from? text.where_from.split("//")[1]: 'crisislogger.org';
    (new Text(text)).save();
  })
  // [add uploads were userId not defined]
  data['uploads'].filter(upload=>upload.user_id == undefined || upload.user_id == null).forEach(upload=>{
    upload['sqlId'] = upload.id;
    upload['approved']= upload.hide == null ? false: !upload.hide;
    upload['where_from']= upload.where_from? upload.where_from.split("//")[1]: '';
    upload['published']= upload.published;
    upload['transcript_rate']= upload.rating;
    (new UploadTable(upload)).save().then(async upload=>{
      // [add transcriptions without userId]
      await addUploadTranscription(upload,null);
    })
  })
}
async function addUploadTranscription (upload,user){
  let transcription = null;
  if(user != null){
    transcription = data['transcriptions'].find(trans=>trans.upload_id == upload.sqlId)
    if(transcription){
      transcription['upload_id'] = upload._id;
      transcription['user_id'] = user._id;
      transcription['where_from'] = upload.where_from;
      transcription['sqlId'] = transcription.id;
      transcription = await(new TranscriptionModel(transcription)).save();
      upload["transcripts"] = transcription._id
      return  await upload.save()
    }
  }else {
    transcription = data['transcriptions'].find(trans=>trans.upload_id == upload.sqlId);
    if(transcription){
      transcription['upload_id'] = upload._id;
      transcription['sqlId'] = transcription.id;
      transcription['where_from'] = upload.where_from;
      transcription = await (new TranscriptionModel(transcription)).save();
      upload["transcripts"] = transcription._id
      return  await upload.save();
    }
  }
  return null
}