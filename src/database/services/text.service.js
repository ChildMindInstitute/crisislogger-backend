import Text from '../models/text.model'

class TextService {
    createTable(createObj) {
        const obj = new Text(createObj)
        return obj.save()
    }
}

export default TextService