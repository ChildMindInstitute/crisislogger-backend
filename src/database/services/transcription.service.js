import transcriptionModel from '../models/transcription.model'

class transcriptionModelService {
    createTable(createObj) {
        const obj = new transcriptionModel(createObj)
        return obj.save()
    }
}

export default transcriptionModelService