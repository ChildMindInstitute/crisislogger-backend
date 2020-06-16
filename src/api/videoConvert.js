import ffmpegpath from 'ffmpeg-static'
import path from 'path'
import { spawn } from 'child_process'
export const GenerateAudioFromVideo = (file, filename) => {
    return new Promise((resolve, rejects) => {
        const ffmpeg = spawn(ffmpegpath, ['-i', file ,'-ac', '1', "./uploads/" + filename + '.wav'])
        ffmpeg.stderr.on('data', data => {
            console.log(`stderr: ${data}`)
        })
        ffmpeg.on('close', (code) => {
            resolve({
                newName: `${filename}.wav`
            })
        })
    })
}
