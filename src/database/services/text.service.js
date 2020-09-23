import Text from '../models/text.model'
class TextService {
    createTable(createObj) {
        const obj = new Text(createObj)
        return obj.save()
    }
    async getUserTexts(user_id, where_from){
        return await Text.find({user_id: user_id, where_from: where_from});
    }
    async getTextWithId(id){
        return await Text.findOne({_id:id}).populate({path:'transcripts'}).populate({path:'user_id'})
    }
    async updateApproveStatus(id,status){
        return await Text.findOneAndUpdate({_id:id},{approved:!status},{new:true}).populate({path:'transcripts'})
        
    }
    async getTextWithFilter(filter){
        return await Text.find(filter)
    }
    async findModel(_id)
    {
        return await Text.find({_id: _id});
    }
    async updateText(id, options){
        await Text.updateOne({_id: id}, options);
    }
    async findTextUploadWithText(text){
        let list=[]
        let res  = await Text.find()
        return res.filter(el=>el.text.includes(text))
        
    }
    async paginate(page, searchText)
    {
        const page_size = 8;
        const skip = (page - 1)* page_size;
        if (searchText.length){
            return await Text.find({text: {'$regex': searchText, '$options': 'i'}, hide: 0, share: {$gte : 1}}).skip(skip).limit(page_size)
        }
        else {
            return await Text.find({hide: 0, share: {$gte : 1}}).skip(skip).limit(page_size)
        }
    }
}

export default TextService