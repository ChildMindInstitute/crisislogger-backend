import UploadTable from '../models/uploadTable.model'

class UploadTableService {
    createTable(createObj) {
        const obj = new UploadTable(createObj)
        return obj.save()
    }
    async updateTable(id, data) {
        await UploadTable.updateOne({_id: id}, data, {upsert: true});
    }
    getUserUploads(user_id){
        return UploadTable.find({user_id: user_id})
    }
    async storeTranscripts(transcript, upload_id) {
        let uploadObj = UploadTable.findById(upload_id)
        console.log(uploadObj)
        uploadObj.transcripts = transcript
        uploadObj.status ='finished';
       return  await uploadObj.save();
    }
}
export default UploadTableService