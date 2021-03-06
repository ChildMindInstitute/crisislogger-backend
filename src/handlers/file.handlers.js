import {uploadFile} from '../api/googleCloudStorage'
import {googleSpeechTranscription} from '../api/googleSpeech'
import TextService from '../database/services/text.service'
import TranscriptionModelService from '../database/services/transcription.service'
import UploadTableService from '../database/services/uploadTable.service'
import UserService from "../database/services/user.service";
import fs, {writeFile} from 'fs'
import {v1} from 'uuid'
import JWT from 'jsonwebtoken'
import axios from "axios";
import async from 'async';
import UploadTable from "../database/models/uploadTable.model";
const UploadService = new UploadTableService()
const TranscriptionService = new TranscriptionModelService()
const TextDBService = new TextService()
import {gcs} from '../../config'
import {Parser} from 'json2csv'

export const uploadFileHandle = async (req, res) => {
  let where_from = req.headers.origin.split('//')[1];
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }
  let user = {};
  if (token) {
    JWT.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (!err) {
        req.decoded = decoded;
      }
    });
  }
  if (req.decoded) {
    user = await UserService.login(req.decoded.email, where_from);
    if (!user) {
      return res.status(401).json({message: 'User does not exist'})
    }
  }
  const uploadDir = './uploads/';
  if (!req.files) {
    return res.status(400).json({
      message: 'No file uploaded'
    })
  } else {
    let file = req.files.file
    let name = v1();
    let extension = file.mimetype.split('/')[1]
    let filename = name + '.' + extension;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    let uploadObj;
    let audioPath = uploadDir + filename;
    writeFile(audioPath, file.data, async (err) => {
      try {
        const result = await uploadFile(filename, audioPath, file.mimetype)
        if (!result.success) {
          return res.status(500).json({message: 'File upload failed, please try again later'})
        }
        uploadObj = await UploadService.createTable({
          name: filename,
          video_generated: 0,
          audio_generated: 0,
          status: 'processing',// for now, it will be processing status.
          rank: 0,
          where_from: req.body.where_from,
          original_name: filename,
          hide: 1,
          voice: req.body.voice,
          share: Number(req.body.publicly),
          contribute_to_science: req.body.contribute_to_science,
          created_at: Date.now(),
          user: (user ? user._id : null),
          user_id: (user ? user._id : null),
          converted: 0
        })
      } catch (err) {
        console.log(err)
        return res.status(500).json({message: err})
      }
      if (err) return res.status(500).json({message: 'Error with save file'})
      setTimeout(async () => {
        if (extension !== 'wav') {
          try {
            let buffer = fs.readFileSync(audioPath);
            let base64data = buffer.toString('base64');
            const convertRequest = {
              file: {
                type: 'video/x-msvideo',
                data: base64data
              },
              webhook_url: process.env.SERVER_URL + '/file/webhook',
              resource_identifier: uploadObj._id
            }


            await axios.post(process.env.CONVERT_SERVER + '/conversion/video', convertRequest, {
              headers: {
                'Content-Type': 'application/json',
              }
            });
            return res.json({upload_id: uploadObj._id})
          } catch (err) {
            console.log(err)
            return res.status(500).json({message: 'Error with convert file'})
          }
        }
        // here we will proceed only wav formatted audio file to get a transcription.
        try {
          let audioFilePath = gcs + '/' + name + '.' + (extension !== 'mp3' && extension !== 'wav' ? 'wav' : extension);
          let transcription = await googleSpeechTranscription(audioFilePath)
          let transcriptionObj = await TranscriptionService.createTable({
            upload_id: uploadObj !== undefined ? uploadObj._id : null,
            user_id: (user ? user._id : null),
            text: transcription.transcriptText,
            created_at: Date.now()
          })
          await UploadService.storeTranscripts(transcriptionObj, uploadObj._id);

        } catch (err) {
          return res.status(500).json({message: 'Error with transcription'})
        }
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath)
        }
        if (fs.existsSync(uploadDir + filename)) {
          fs.unlinkSync(uploadDir + filename)
        }
        return res.json({upload_id: uploadObj._id})
      }, 1000)
    })
  }
}
export const conversionFinishedHandle = async (req, res) => {
  try {
    const body = req.body;
    if (!body.resource_identifier) {
      return res.json({message: 'Identifier not found'})
    }
    const text = await TextDBService.createTable({
      text: req.body.text,
      share: Number(req.body.publicly),
      voice: req.body.voice,
      contribute_to_science: req.body.contribute_to_science,
      rank: req.body.rank,
      where_from: req.body.where_from,
      hide: 1,
      created_at: Date.now(),
      user_id: (user._id !== undefined ? user._id : null)
    })
    return res.json({upload_id: text._id})
  } catch (err) {
    console.log(err)
    return res.status(500).json({message: err})
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
        if (!err) {
          req.decoded = decoded;
        }
      });
    }
    let where_from = req.headers.origin.split('//')[1];
    if (req.decoded) {
      user = await UserService.login(req.decoded.email, where_from);
      if (!user) {
        return res.status(401).json({message: 'User does not exist'})
      }
    }
    const text = await TextDBService.createTable({
      text: req.body.text,
      share: Number(req.body.publicly),
      voice: req.body.voice,
      contribute_to_science: req.body.contribute_to_science,
      rank: req.body.rank,
      hide: 1,
      created_at: Date.now(),
      where_from: req.body.where_from,
      user_id: (user._id !== undefined ? user._id : null)
    })
    return res.json({upload_id: text._id})
  } catch (err) {
    console.log(err)
    return res.status(500).json({message: err})
  }
}

export const getGalleryData = async (req, res) => {
  try {
    let page = parseInt(req.query.page);
    let searchTxt = req.query.searchTxt;
    let where_from = req.headers.origin.split('//')[1];
    let uploads = await UploadService.paginate(page, searchTxt, where_from)
    let texts = await TextDBService.paginate(page, searchTxt, where_from);
    uploads = uploads.concat(texts);
    return res.json({uploads: uploads})
  } catch (err) {
    console.log(err)
    return res.status(500).json({message: err})
  }
}
export const downloadCsvData = async (req, res) => {
  function isVideo(record) {
    return record.name !== undefined && (record.name.split(".")[1] === 'webm' || record.name.split(".")[1] === 'mkv' || record.name.split(".")[1] === 'mp4');

  }

  function isAudio(record) {
    return record.name !== undefined && (record.name.split(".")[1] === 'wav');

  }

  function isText(record) {
    return record.text !== undefined;

  }

  function getMediaType(m) {
    if (isVideo(m)) {
      return "Video Transcript"
    } else if (isAudio(m)) {
      return "Audio Transcript"
    } else {
      return "Text"
    }
  }

  function getTranscriptOrText(m) {
    if (isVideo(m) || isAudio(m)) {
      if (m.transcripts) {
        return m.transcripts.text
      }
    } else {
      return m.text
    }
    return ""
  }

  function getFileName(m) {
    if (isVideo(m) || isAudio(m)) {
      return m.name
    } else {
      return m._id
    }
  }

  try {
    let where_from = req.headers.origin.split('//')[1];
    let uploads = await UploadService.getUploadsWithFilter({where_from: where_from})
    let texts = await TextDBService.getTextWithFilter({where_from: where_from})
    let combineData = [...uploads, ...texts]
    let copyData = combineData.filter((e) => e.share && e.approved).map(m => ({
      "Media Type": getMediaType(m),
      "Content": getTranscriptOrText(m),
      "Submission Date": new Date(m.created_at).toLocaleDateString(),
      "File name": getFileName(m),
    }))
    const fields = [
      {
        label: "Date",
        value: 'date'
      },
      {
        label: "Video",
        value: 'video'
      },
      {
        label: "Audio",
        value: 'audio'
      }
      , {
        label: "Text",
        value: 'Text'
      }
    ];
    const json2csv = new Parser(fields)
    const csv = json2csv.parse(copyData)
    res.header('Content-Type', 'text/csv');
    res.header('filename', 'csv_exported.csv');

    res.attachment("csv_exported.csv");
    return res.send(csv)
  } catch (err) {
    console.log(err)
    return res.status(500).json({message: err})
  }
}

export const webhook = async (req, res) => {
  const data = req.body;
  let tempFileName  = v1();
  const audioFile = `./uploads/${tempFileName + '.wav'}`;
  const videoFile = `./uploads/${tempFileName + '.mp4'}`;
  if (!data.videoFile || !data.audioFile ||  !data.resource_identifier)
  {
      return res.status(400).json({
          message: 'Missing required params'
      });
  }
  const files = {audio: data.audioFile, video: data.videoFile}
  let upload = await UploadTable.findOne({_id: data.resource_identifier})
  try {
      await async.forEachOf(files, async (value, key) => {
          if (key === 'video')
          {
              await fs.writeFile(videoFile, value.data, 'base64', async (err) => {
                  if (err)
                  {
                      console.log(err);
                      return  false;
                  }
                  const result = await uploadFile(videoFile, videoFile,  '')
                  if (result.success)
                  {
                      let options = {
                          name : tempFileName+'.mp4',
                          audio_generated: 1,
                          status: 'finished' // we need to change the status of uploaded records
                      }
                      await UploadService.updateTable(upload._id, options);
                  }
                  fs.unlinkSync(videoFile)
              })
          }
          else {
              setTimeout(async () => {
                  await fs.writeFile(audioFile, value.data, 'base64', async (err, resultFile) => {
                      if (err) {
                          console.log(err);
                          return false;
                      }
                      const result = await uploadFile(audioFile, audioFile,  '');
                      if (result.success)
                      {
                          let audioFilePath = gcs+ '/'+tempFileName+'.wav';
                          let transcription = await googleSpeechTranscription(audioFilePath)
                          let transcriptionObj = await TranscriptionService.createTable({
                              upload_id: upload._id,
                              user_id: upload.user_id,
                              text: transcription.transcriptText,
                              created_at: upload.created_at
                          })
                          await UploadService.storeTranscripts(transcriptionObj, upload._id);
                      }
                      fs.unlinkSync(audioFile)
                  });
              }, 1500)
          }
      })
      return res.status(200).json({
          message: 'Success'
      });
  }
  catch (e) {
      console.log(e)
      return  res.status(500).json({message : e})
  }
}
export const processFailedUploads =  async() => {
  let uploads = await UploadService.getFaildUploads();
  console.log(uploads)
  if(uploads && uploads.length)
  {
    const uploadDir = './uploads/';
    uploads.forEach(async (upload) => {
      try {
            let buffer = fs.readFileSync(uploadDir+ upload.name);
            let base64data = buffer.toString('base64');
            const convertRequest = {
              file: {
                type: 'video/x-msvideo',
                data: base64data
              },
              webhook_url: process.env.SERVER_URL + '/file/webhook',
              resource_identifier: upload._id
            }


            await axios.post(process.env.CONVERT_SERVER + '/conversion/video', convertRequest, {
              headers: {
                'Content-Type': 'application/json',
              }
            });
          } catch (err) {
            console.log(err)
          }
    })
  }
} 