import ffmpegpath from 'ffmpeg-static'
import path from 'path'
import { spawn } from 'child_process'
import {getPublicURL} from '../api/googleCloudStorage'
export const GenerateAudioFromVideo = (file, filename) => {
    return new Promise((resolve, rejects) => {
        const ffmpeg = spawn(ffmpegpath, ['-i', file ,'-codec:v', 'copy','-codec:a', 'libmp3lame' , "./uploads/" + filename + '.mp3'])
        ffmpeg.stderr.on('data', data => {
            console.log(`stderr: ${data}`)
        })
        ffmpeg.on('close', (code) => {
            resolve({
                newName: `${filename}.mp3`
            })
        })
    })
}