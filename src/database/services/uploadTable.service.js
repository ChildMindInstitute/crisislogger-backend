import UploadTable from '../models/uploadTable.model'
import {encrypt, decrypt} from '../../api/Encrypter';
class UploadTableService {
    createTable(createObj) {
        const obj = new UploadTable(createObj)
        return obj.save()
    }
    async updateTable(id, data) {
        const status = await UploadTable.updateOne({_id: id}, data, {upsert: true});
    }
    async getUserUploads(user_id){
        let uploads = await UploadTable.find({user_id: user_id}).populate('transcripts');
        uploads.forEach((item) => {
            item.transcripts.text = decrypt(item.transcripts.text)
        })
        return uploads
    }
    async storeTranscripts(transcript, upload_id) {
       return UploadTable.findOneAndUpdate({ _id: upload_id }, { transcripts: transcript, status: 'finished' })
    }
}
export default UploadTableService