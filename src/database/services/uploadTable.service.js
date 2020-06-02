import UploadTable from '../models/uploadTable.model'
import Text from "../models/text.model";

class UploadTableService {
    createTable(createObj) {
        const obj = new UploadTable(createObj)
        return obj.save()
    }
    async updateTable(id, data) {
        await UploadTable.updateOne({_id: id}, data, {upsert: true});
    }
    async getUserUploads(user_id){
        return UploadTable.find({user_id : user_id , video_generated: false})
            .populate('transcripts')
    }
    async storeTranscripts(transcript, upload_id) {
        let uploadObj = await UploadTable.findById(upload_id)
        uploadObj.transcripts = transcript
        uploadObj.status ='finished';
        uploadObj.audio_generated = 1;
       return  await UploadTable.updateOne({_id: upload_id}, uploadObj, {upsert: true});
    }
}
export default UploadTableService