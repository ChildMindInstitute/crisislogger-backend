import { audioConvertFormat } from '../api/audioConver'
import { uploadFile, getPublicURL } from '../api/googleCloudStorage'
import { googleSpeechTranscription } from '../api/googleSpeech'
import { GenerateAudioFromVideo } from '../api/videoConvert'
import TextService from '../database/services/text.service'
import TranscriptionModelService from '../database/services/transcription.service'
import UploadTableService from '../database/services/uploadTable.service'
import fs, { writeFile } from 'fs'
import { v1} from 'uuid'
const UploadService = new UploadTableService()
const TranscriptionService = new TranscriptionModelService()
const TextDBService = new TextService()
const gcs = "gs://"+process.env["BUCKET_NAME "];
export const uploadFileHandle = async (req, res) => {
    const uploadDir = './uploads/';
    if(!req.files) {
        return res.status(400).send({
            message: 'No file uploaded'
        })
    } else {
        console.log(req.body)
        let file = req.files.file
        let name = v1();
        let extension = file.mimetype.split('/')[1]
        let filename = name+'.'+extension;
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir);
        }
        let uploadObj; let audioPath = uploadDir+ filename;
        writeFile(audioPath, file.data, async (err) => {
            try {
                const result = await uploadFile(filename, audioPath,  file.mimetype)
                if (!result.success)
                {
                    return  res.status(500).send('File upload failed, please try again later')
                }
                uploadObj = await UploadService.createTable({
                    name: filename,
                    video_generated: file.mimetype.split('/')[0] === 'video' ? 1 : 0,
                    audio_generated: 0,
                    status: 'processing',
                    rank: 0,
                    original_name: filename,
                    hide: req.body.publicly === '2',
                    voice: req.body.voice,
                    share: req.body.publicly,
                    contribute_to_science: req.body.contribute_to_science,
                    created_at: new Date(),
                    converted: file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/vnd.wave' ? 0 : 1,
                })
            } catch(err) {
                console.log(err)
                return   res.status(500).send(err)
            }
            if(err)  return  res.status(500).send('Error with save file')
            setTimeout(async () => {
                if(extension !=='mp3' && extension !=='wav') {
                    try {
                        let convertFile;
                        convertFile = await GenerateAudioFromVideo(audioPath, name)
                        audioPath = uploadDir+ convertFile.newName;
                        const uploadConvert = await uploadFile(convertFile.newName, uploadDir+ convertFile.newName, 'audio/mp3')
                        if (uploadConvert.success)
                        {
                            UploadService.createTable({
                                name: convertFile.newName,
                                video_generated: 1,
                                audio_generated: 0,
                                status: 'finished',
                                rank: req.body.rank,
                                original_name: file.name,
                                hide: req.body.hide,
                                voice: req.body.publicly,
                                share: req.body.publicly,
                                contribute_to_science: req.body.contribute_to_science,
                                created_at: new Date(),
                                converted: file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/vnd.wave' ? 0 : 1,
                            })
                        }
                    } catch(err) {
                        console.log(err)
                        return  res.status(500).send('Error with convert file')
                    }
                }

                try{
                    let audioFilePath = gcs+ '/'+name+'.'+ (extension !== 'mp3' &&  extension !=='wav'?'mp3': extension);
                    let transcription = await googleSpeechTranscription(audioFilePath)
                    let transcriptionObj = TranscriptionService.createTable({
                        upload_id: uploadObj !== undefined? uploadObj._id: null,
                        user_id: '',
                        text: transcription.transcriptText,
                        created_at: Date.now()
                    })
                    await UploadService.storeTranscripts(transcriptionObj, uploadObj._id);

                } catch(err) {
                    console.log(err)
                    return   res.status(500).send('Error with transcription')
                }
                if (fs.existsSync(audioPath))
                {
                    fs.unlinkSync(audioPath)
                }
                if (fs.existsSync(uploadDir+ filename))
                {
                    fs.unlinkSync(uploadDir+ filename)
                }
                return  res.send({ upload_id: uploadObj._id })
            }, 1000)
        })
    }
}


export const uploadTextHandle = async (req, res) => {
    try {
        const text = await TextDBService.createTable({
            text: req.body.text,
            share: req.body.share,
            voice: req.body.voice,
            contribute_to_science: req.body.contribute_to_science,
            rank: req.body.rank,
            hide:  req.body.publicly === '2',
            created_at: Date.now()
        })
        return  res.send({ upload_id: text._id })
    } catch(err) {
        console.log(err)
        return  res.status(500).send()
    }
}