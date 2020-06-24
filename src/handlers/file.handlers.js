import { uploadFile, getPublicURL } from '../api/googleCloudStorage'
import { googleSpeechTranscription } from '../api/googleSpeech'
import { GenerateAudioFromVideo } from '../api/videoConvert'
import TextService from '../database/services/text.service'
import TranscriptionModelService from '../database/services/transcription.service'
import UploadTableService from '../database/services/uploadTable.service'
import UserService from "../database/services/user.service";
import fs, { writeFile } from 'fs'
import { v1} from 'uuid'
import JWT from 'jsonwebtoken'
import axios from "axios";
const UploadService = new UploadTableService()
const TranscriptionService = new TranscriptionModelService()
const TextDBService = new TextService()
import {gcs} from '../../config'
export const uploadFileHandle = async (req, res) => {

    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }
    let user = {};
    if (token) {
        JWT.verify(token, process.env.SECRET_KEY, (err, decoded) => {
           if(!err) {
                req.decoded = decoded;
            }
        });
    }
    if (req.decoded)
    {
        user = await UserService.login(req.decoded.email);
        if (!user)
        {
            return res.status(401).json({message : 'User does not exist'})
        }
    }
    const uploadDir = './uploads/';
    if(!req.files) {
        return res.status(400).json({
            message: 'No file uploaded'
        })
    } else {
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
                    return  res.status(500).json({message : 'File upload failed, please try again later'})
                }
                uploadObj = await UploadService.createTable({
                    name: filename,
                    video_generated: 0,
                    audio_generated: 0,
                    status: 'processing',// for now, it will be processing status.
                    rank: 0,
                    original_name: filename,
                    hide: req.body.publicly === '2',
                    voice: req.body.voice,
                    share: Number(req.body.publicly),
                    contribute_to_science: req.body.contribute_to_science,
                    created_at: Date.now(),
                    user: (user? user._id: null),
                    user_id: (user? user._id: null),
                    converted: 0
                })
            } catch(err) {
                console.log(err)
                return   res.status(500).json({message: err})
            }
            if(err)  return  res.status(500).json({message : 'Error with save file'})
            setTimeout(async () => {
                if(extension !=='wav') {
                    try {
                        let buffer = fs.readFileSync(audioPath);
                        let base64data = buffer.toString('base64');
                        const convertRequest = {
                            file: {
                                type:'video/x-msvideo',
                                data: base64data
                            },
                            webhook_url: 'http://'+ process.env.SERVER_URL + ':'+ process.env.SERVER_PORT+'/conversion/webhook',
                            resource_identifier: uploadObj._id
                        }

                        await axios.post(process.env.CONVERT_SERVER+'/conversion/video', convertRequest, {
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });
                        return  res.json({ upload_id: uploadObj._id })
                    } catch(err) {
                        console.log(err)
                        return  res.status(500).json({message: 'Error with convert file'})
                    }
                }
                // here we will proceed only wav formatted audio file to get a transcription.
                try {
                    let audioFilePath = gcs+ '/'+name+'.'+ (extension !== 'mp3' &&  extension !=='wav'?'wav': extension);
                    let transcription = await googleSpeechTranscription(audioFilePath)
                    let transcriptionObj = await TranscriptionService.createTable({
                        upload_id: uploadObj !== undefined? uploadObj._id: null,
                        user_id: (user? user._id: null),
                        text: transcription.transcriptText,
                        created_at: Date.now()
                    })
                    await UploadService.storeTranscripts(transcriptionObj, uploadObj._id);

                } catch(err) {
                    console.log(err)
                    return   res.status(500).json({message: 'Error with transcription'})
                }
                if (fs.existsSync(audioPath))
                {
                    fs.unlinkSync(audioPath)
                }
                if (fs.existsSync(uploadDir+ filename))
                {
                    fs.unlinkSync(uploadDir+ filename)
                }
                return  res.json({ upload_id: uploadObj._id })
            }, 1000)
        })
    }
}
export const conversionFinishedHandle = async (req, res) => {
    // this is a web_hook handler which will be called by conversion server.
    // so here once we get the upload table id as resource_identifier and converted  audio file, then
    // here we will get a transcription with that audio and save transcription table, upload that audio to GCS, create
    // the new upload row in upload table with that audio.
    // also we need to update the status field of upload data which id is resource_identifier to "finished"
    // when create the new upload row with new audio file, also the status need to be "finished"
    try {
        const body = req.body;
        if (!body.resource_identifier)
        {
            return res.json({message : 'Indentifier not found'})
        }
        // const videoFile = body.videoFile;
        // const audioFile = body.audioFile;
        // const id = body.resource_identifier;
        const text = await TextDBService.createTable({
            text: req.body.text,
            share: Number(req.body.publicly),
            voice: req.body.voice,
            contribute_to_science: req.body.contribute_to_science,
            rank: req.body.rank,
            hide:  req.body.publicly === '2',
            created_at: Date.now(),
            user_id: (user._id !== undefined? user._id: null)
        })
        return  res.json({ upload_id: text._id })
    } catch(err) {
        console.log(err)
        return  res.status(500).json({message: err})
    }
}

export const uploadTextHandle = async (req, res) => {
    try {
        let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }
        let user = {};
        if (token) {
            JWT.verify(token, process.env.SECRET_KEY, (err, decoded) => {
                if(!err) {
                    req.decoded = decoded;
                }
            });
        }
        if (req.decoded)
        {
            user = await UserService.login(req.decoded.email);
            if (!user)
            {
                return res.status(401).json({message : 'User does not exist'})
            }
        }
        const text = await TextDBService.createTable({
            text: req.body.text,
            share: Number(req.body.publicly),
            voice: req.body.voice,
            contribute_to_science: req.body.contribute_to_science,
            rank: req.body.rank,
            hide:  req.body.publicly === '2',
            created_at: Date.now(),
            user_id: (user._id !== undefined? user._id: null)
        })
        return  res.json({ upload_id: text._id })
    } catch(err) {
        console.log(err)
        return  res.status(500).json({message: err})
    }
}