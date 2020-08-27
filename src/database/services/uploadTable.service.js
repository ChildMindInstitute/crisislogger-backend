import UploadTable from '../models/uploadTable.model'

class UploadTableService {
    createTable(createObj) {
        const obj = new UploadTable(createObj)
        return obj.save()
    }
    async updateTable(id, options) {
        const status = await UploadTable.updateOne({_id: id}, options);
    }
    async getUserUploads(user_id, where_from){
        return UploadTable.find({user_id: user_id, where_from: where_from}).populate('transcripts');
    }
    async storeTranscripts(transcript, upload_id) {
       return UploadTable.findOneAndUpdate({ _id: upload_id }, { transcripts: transcript, status: 'finished' })
    }
    async paginate(page, searchText) {
        const page_size = 8;
        const skip = (page - 1)* page_size;
        if (searchText && searchText.length){
            return await UploadTable.find({hide: 0, share: {$gte : 1}}).populate({
                path: 'transcripts',
                match: {text: {$regex: searchText}}
            }).skip(skip).limit(page_size)
        }
        else {
            return await UploadTable.find({hide: 0, share: {$gte : 1}}).populate('transcripts').skip(skip).limit(page_size)
        }
    }
}
export default UploadTableService