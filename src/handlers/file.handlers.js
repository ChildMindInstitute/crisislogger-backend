import { audioConvertFormat } from '../api/audioConver'
import { uploadFile } from '../api/googleCloudStorage'
import { googleSpeechTranscription } from '../api/googleSpeech'
import { GenerateAudioFromVideo } from '../api/videoConvert'
import TextService from '../database/services/text.service'
import transcriptionModelService from '../database/services/transcription.service'
import uploadTableService from '../database/services/uploadTable.service'
import { promisify } from 'util'
import { writeFile } from 'fs'


export const uploadFileHandle = async (req, res) => {

    if(!req.files) {
        res.status(400).send({
            message: 'No file uploaded'
        })
    } else {
        let file = req.files.file
        writeFile('./uploads/'+ file.name, file.data, async (err) => {
            try { 
                const gscData = await uploadFile('./uploads/'+ file.name)
                uploadTableService.createTable({
                    name: gscData.name,
                    video_generated: file.mimetype.split('/')[0] === 'video' ? 1 : 0,
                    audio_generated: 0,
                    status: 'draft',
                    rank: req.body.rank,
                    original_name: file.name,
                    hide: req.formData === '2',
                    voice: req.body.voice,
                    share: req.publicly,
                    contribute_to_science: req.contribute_to_sciendce,
                    created_at: new Date(),
                    converted: file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/vnd.wave' ? 0 : 1,
                })
            } catch(err) {
               res.status(500).send(err)
            }
            

            if(err) res.status(500).send('Error with save file')

            setTimeout(async () => {
                if(file.mimetype !== 'audio/mpeg' || file.mimetype !== 'audio/vnd.wave') {
                    try {
                        let convertFile;
                        if(file.mimetype.split('/')[0] === 'audio') {

                            convertFile = await audioConvertFormat(file)

                        } else {

                            convertFile = await GenerateAudioFromVideo(file)

                            const uploadConvert = await uploadFile(convertFile)
                            uploadTableService.createTable({
                                name: gscData.name,
                                video_generated: file.mimetype.split('/')[0] === 'video' ? 1 : 0,
                                audio_generated: 0,
                                status: 'draft',
                                rank: req.body.rank,
                                original_name: file.name,
                                hide: req.body.hide,
                                voice: req.body.voice,
                                share: req.body.share,
                                contribute_to_science,
                                created_at: new Date(),
                                converted: file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/vnd.wave' ? 0 : 1,
                            })

                        }
                    } catch(err) {
                        res.status(500).send('Error with convert file')
                    }
                } 

                try{ 
                    let transcription = await googleSpeechTranscription(file)
                    transcriptionModelService.createTable({
                        upload_id: '',
                        user_id: '',
                        text: transcription,
                        created_at: Date.now()
                    })
                    TextService.createTable({
                        text: transcription,
                        share: req.body.share,
                        voice: req.body.voice,
                        share: req.body.share,
                        contribute_to_science,
                        rank: req.body.rank,
                        hide: req.body.hide,
                        created_at: Date.now()
                    })
                } catch(err) {
                    res.status(500).send('Error with trascription')
                }
            }, 3000)
        })
    }
}