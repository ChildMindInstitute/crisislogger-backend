import Text from '../models/text.model'
import UploadTable from "../models/uploadTable.model";

class TextService {
    createTable(createObj) {
        const obj = new Text(createObj)
        return obj.save()
    }
    getUserTexts(user_id){
        return Text.find({user_id : user_id})
    }
    async updateText(id, obj){
        await Text.updateOne({_id: id}, obj, {upsert: true});
    }
}

export default TextService