import { GenerateAudioFromVideo } from '../api/videoConvert'
import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg';
import { v1} from 'uuid'
import FileType from 'file-type';
import {uploadFile} from "../api/googleCloudStorage";
import {gcs} from '../../config'
import {googleSpeechTranscription} from "../api/googleSpeech";
import async from 'async';
import UploadTable from "../database/models/uploadTable.model";
import UploadTableService from "../database/services/uploadTable.service";
import TranscriptionModelService from "../database/services/transcription.service";
const UploadService = new UploadTableService()
const TranscriptionService = new TranscriptionModelService()
/**
 * Convert file to mp4
 * @param {String} input Input file path
 * @param {String} output Output file path
 * @param {function} callback 
 */
const convert = (input, output, callback) => {
    return new Promise((resolve, reject) => { 
        if (output.indexOf('mp3') !== false)
        {
            ffmpeg(input)
                .output(output)
                .audioCodec('libfdk_aac')
                .on('start', () => {
                    console.log('conversion started',  new Date().toISOString());
                })
                .on('end', () => {
                    console.log('conversion ended',  new Date().toISOString());
                    resolve(true)
                }).on('error', function(err){
                    reject(false)
            }).run();
        }
        else {
            ffmpeg(input)
                .output(output)
                .audioCodec('libfdk_aac')
                .videoCodec('libx264')
                .on('start', () => {
                    console.log('conversion started',  new Date().toISOString());
                })
                .on('end', () => {
                    console.log('conversion ended',  new Date().toISOString());
                    resolve(true)
                }).on('error', function(err){
                    reject(false)
            }).run();
        }
    })
}

/**
 * Queue task for converting video & getting audio and sending path
 * @param {Object} data 
 */
const createFile = (data) => {
    const tempFileName =  v1();
    const audioFileName = v1();
    const tempFile = `./uploads/${tempFileName + '_temp'}`;
    const resultFile = `./uploads/${tempFileName}.mp4`;
    const result = {
        webhook_url: data.webhook_url,
        videoFile: null,
        audioFile: null,
        resource_identifier: data.resource_identifier
    };

    return new Promise((resolve, reject) => {
        fs.writeFile(tempFile, data.file.data, 'base64', async (err,data) => {
            if (err) {
                console.log(err);
                reject(err);
            }

            const audioFile = await GenerateAudioFromVideo(tempFile, audioFileName);
            let audioBuffer = fs.readFileSync(`./uploads/${audioFile.newName}`);
            let audioData = audioBuffer.toString('base64');
            result.audioFile = {
                type : 'audio/x-wav',
                data: audioData
            };

            const fileType = await FileType.fromFile(tempFile);
            if (fileType.ext !== 'mp4') {
               const converted =  await convert(tempFile, resultFile)
               if (converted)
               {
                    let videoBuffer = fs.readFileSync(resultFile);
                    let videoData = videoBuffer.toString('base64');
                    result.videoFile = {
                        type : 'video/x-msvideo',
                        data: videoData
                    };
                    fs.unlinkSync(tempFile);
                    resolve(result);
               }
               else {
                    let videoBuffer = fs.readFileSync(resultFile);
                    let videoData = videoBuffer.toString('base64');
                    result.videoFile = {
                        type : 'video/x-msvideo',
                        data: videoData
                    };
                    fs.unlinkSync(tempFile);
                    resolve(result);
               }
                    
            } else {
                await  fs.rename( tempFile, resultFile, () => {
                    let videoBuffer = fs.readFileSync(resultFile);
                    let videoData = videoBuffer.toString('base64');
                    result.videoFile = {
                        type:'video/x-msvideo',
                        data: videoData
                    };
                    resolve(result);
                });
            }
        });
    });
}

export const convertVideoToMp4 = (req, res) => {
    const data = req.body;
    if (!data.file || !data.resource_identifier || !data.webhook_url)
        return res.status(400).json({
            message: 'Missing required params'
        });

    req.asyncQuery.push(() => createFile(data), () => {});

    res.status(200).json({
        message: 'Ok'
    });
}

