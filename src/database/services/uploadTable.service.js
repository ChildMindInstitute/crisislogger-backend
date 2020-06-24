import UploadTable from '../models/uploadTable.model'

class UploadTableService {
    createTable(createObj) {
        const obj = new UploadTable(createObj)
        return obj.save()
    }
    async updateTable(id, data) {
        const status = await UploadTable.updateOne({_id: id}, data, {upsert: true});
        console.log(status)
    }
    getUserUploads(user_id){
        return UploadTable.find({user_id: user_id}).populate('transcripts')
    }
    async storeTranscripts(transcript, upload_id) {
       return UploadTable.findOneAndUpdate({ _id: upload_id }, { transcripts: transcript, status: 'finished' })
    }
}
export default UploadTableService