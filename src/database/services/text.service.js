import Text from '../models/text.model'
class TextService {
    createTable(createObj) {
        const obj = new Text(createObj)
        return obj.save()
    }
    async getUserTexts(user_id, where_from){
        return await Text.find({user_id: user_id, where_from: where_from});
    }
    async findModel(_id)
    {
        return await Text.find({_id: _id});
    }
    async updateText(id, obj){
        await Text.updateOne({_id: id}, obj, {upsert: true});
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