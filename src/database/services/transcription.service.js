import TranscriptionModel from '../models/transcription.model'

class TranscriptionModelService {
    createTable(createObj) {
        const obj = new TranscriptionModel(createObj)
        return obj.save()
    }
}

export default TranscriptionModelService