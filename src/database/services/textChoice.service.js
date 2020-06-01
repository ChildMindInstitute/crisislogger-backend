import textChoice from '../models/TextChoice.model'

class TextChoiceService {
    createObj(obj) {
        const textChoiceObject = new textChoice(obj)
        textChoiceObject.save()
    }
}

export default TextChoiceService