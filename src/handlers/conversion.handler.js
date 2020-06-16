import { GenerateAudioFromVideo } from '../api/videoConvert'
import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg';
import { v1} from 'uuid'
import FileType from 'file-type';

/**
 * Convert file to mp4
 * @param {String} input Input file path
 * @param {String} output Output file path
 * @param {function} callback 
 */
const convert = (input, output, callback) => {
    ffmpeg(input)
        .output(output)
        .on('start', () => {
            console.log('conversion started',  new Date().toISOString());
        })
        .on('end', () => {                    
            console.log('conversion ended',  new Date().toISOString());
            callback(null);
        }).on('error', function(err){
            console.log('error: ', err);
            callback(err);
        }).run();
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
        videoFile: tempFileName + '.mp4',
        audioFile: null,
    };

    return new Promise((resolve, reject) => {
        fs.writeFile(tempFile, data.file.data, 'base64', async (err,data) => {
            if (err) {
                console.log(error);
                reject(err);
            }
    
            const audioFile = await GenerateAudioFromVideo(tempFile, audioFileName);
            result.audioFile = audioFile.newName;
    
            const fileType = await FileType.fromFile(tempFile);
            if (fileType.ext === 'mp4') {
                convert(tempFile, resultFile, (err) => {
                    if (err) {
                        console.log(error);
                        reject(err);
                    }
                    fs.unlinkSync(tempFile);
                    resolve(result);
                });
            } else {
                fs.rename( tempFile, resultFile, () => console.log('renamed'));
                resolve(result);
            }
        });
    });

}

export const convertVideoToMp4 = (req, res) => {
    const data = req.body;

    if (!data.file || !data.resource_Identifier || !data.webhook_url) 
        return res.status(400).json({
            message: 'Missing required params'
        });

    req.asyncQuery.push(() => createFile(data), () => {});

    res.status(200).json({
        message: 'Ok'
    });
}