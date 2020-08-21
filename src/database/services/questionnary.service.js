import Questionnaire from '../models/questionnary.model'
class QuestionnaireService {
    createDBObject(user_id, questionnaireData){
        const userData = new Questionnaire({ user_id, questionnaireData })
        return userData.save()
    }
}

export default QuestionnaireService