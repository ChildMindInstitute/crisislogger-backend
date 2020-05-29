import { storage } from './googleCloudStorage'
import speech from '@google-cloud/speech'
import fs from 'fs'

export const googleSpeechTranscription = async (fileName) => {
    const client = new speech.SpeechClient();

    const file = fs.readFileSync(fileName)
    const audioBytes = file.toString('base64')

    const audio = {
        content: audioBytes
    }

    const config = {
        encoding: 'LINEAR16',
        sampleRateHertsz: 16000,
        languageCode: 'en-US',
    };

    const request = {
        audio,
        config
    }

    const [response] = await client.recognize(request)

    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n')


    return {
        transcriptText: transcription
    }
}