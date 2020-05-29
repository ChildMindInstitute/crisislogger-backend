import ffmpegpath from 'ffmpeg-static'
import path from 'path'
import { spawn } from 'child_process'

export const GenerateAudioFromVideo = (file) => {
    let nameFile = file.name.split('.')[0]
    let originPath = path.resolve(__dirname, '../../uploads/', file.name)

    return new Promise((resolve, rejects) => {
        const ffmpeg = spawn(ffmpegpath, ['-i', originPath, "./uploads/" + nameFile + '.mp3'])
        ffmpeg.stderr.on('data', data => {
            console.log(`stderr: ${data}`)
        })
        ffmpeg.on('close', (code) => {
            resolve({
                newName: `${nameFile}.mp3`
            })
        })
    })
}