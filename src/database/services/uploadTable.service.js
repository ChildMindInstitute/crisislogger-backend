import uploadTable from '../models/uploadTable.model'

class uploadTableService {
    createTable(createObj) {
        const obj = new uploadTable(createObj)
        return obj.save()
    }
}

export default uploadTableService