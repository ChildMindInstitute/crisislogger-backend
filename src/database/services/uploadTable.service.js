import { retry } from 'async';
import UploadTable from '../models/uploadTable.model'
import {text} from "body-parser";

class UploadTableService {
    createTable(createObj) {
        const obj = new UploadTable(createObj)
        return obj.save()
    }
    async updateTable(id, options) {
        const status = await UploadTable.updateOne({_id: id}, options);
    }
    async getUserUploads(user_id, where_from){
        return await UploadTable.find({user_id: user_id, where_from: where_from}).populate('transcripts');
    }
    async getFaildUploads()
    {
        return await UploadTable.find({status: 'processing'});
    }
    async getUploadById(id){
        return await UploadTable.findOne({_id:id}).populate({path:'transcripts'}).populate({path:'user'})
    }
    async updateApproveStatus(id,status){
        return await UploadTable.findOneAndUpdate({_id:id},{approved:!status},{useFindAndModify: false, new: true,  returnOriginal: false}).populate({path:'transcripts'})
        
    }
    async updatePublishStatus(id,status){
        return await UploadTable.findOneAndUpdate({_id:id},{published:!status},{useFindAndModify: false, new: true,  returnOriginal: false}).populate({path:'transcripts'})
        
    }
    async getUploadsContainingText(text){
        let list=[]
        let res = await UploadTable.find().populate('transcripts');
        res.forEach(el=>{
            if(el.transcripts !=undefined && el.transcripts.text.includes(text)){
                list.push(el)
            }
        })
        return list
    }
    async getUploadsWithFilter(filter){
        return await UploadTable.find(filter)
    }
    async getUploadsByIds(ids){
        return await UploadTable.find({_id:{$in:ids}}).populate({path:'transcripts'}).populate({path:'user'})
    }
    async storeTranscripts(transcript, upload_id) {
       return await UploadTable.findOneAndUpdate({ _id: upload_id }, { transcripts: transcript, status: 'finished' },{useFindAndModify: false, new: true,  returnOriginal: false})
    }
    async paginate(page, searchText, domain) {
        const page_size = 8;
        const skip = (page - 1)* page_size;
        let ids = [];
        if (searchText && searchText.length){
            ids = [...await (await this.getUploadsContainingText(searchText)).map(el => el._id)]
            let res = [ ... await (await UploadTable.find({approved: true, where_from: domain, share: {$gte : 1}, _id: {"$in": ids}}).populate('transcripts'))]
            return res.slice((page - 1) * page_size, page * page_size)
        }
        else {
            return await UploadTable.find({approved: true, where_from: domain, share: {$gte : 1}}).populate('transcripts').skip(skip).limit(page_size)
        }
    }
}
export default UploadTableService