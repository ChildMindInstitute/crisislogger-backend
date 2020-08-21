import Text from '../models/text.model'
import UploadTable from "../models/uploadTable.model";
import {encrypt, decrypt} from '../../api/Encrypter';
class TextService {
    createTable(createObj) {
        createObj.text = encrypt(createObj.text)
        const obj = new Text(createObj)
        return obj.save()
    }
    async getUserTexts(user_id){
        let texts = await Text.find({user_id : user_id});
        texts.forEach((item) => {
            item.text = decrypt(item.text)
        })
        return texts;
    }
    async findModel(_id)
    {
        let text = await Text.find({_id: _id});
        if (text)
        {
            text.text = decrypt(text.text)
        }
        return text;
    }
    async updateText(id, obj){
        await Text.updateOne({_id: id}, obj, {upsert: true});
    }
}

export default TextService