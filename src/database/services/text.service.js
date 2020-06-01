import Text from '../models/text.model'

class TextService {
    createTable(createObj) {
        const obj = new Text(createObj)
        return obj.save()
    }
    getUserTexts(user_id){
        return Text.find({user_id : user_id})
    }
}

export default TextService