import speech from '@google-cloud/speech'
import fs from 'fs'

export const googleSpeechTranscription = async (gcsFilePath) => {
    const client = new speech.SpeechClient();
    if (!gcsFilePath.length || fs.existsSync(gcsFilePath))
    {
        return {
            transcriptText: null
        }
    }
    let  audio  = {
        uri: gcsFilePath
    }
    const config = {
        encoding: 'ENCODING_UNSPECIFIED',
        sampleRateHertsz: 16000,
        audioChannelCount: 1,
        languageCode: 'en-US',
    };

    const request = {
        audio: audio,
        config: config
    }

    try {
        const [operation] = await client.longRunningRecognize(request)
        const [response] = await operation.promise()
        const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n')
        return {
            transcriptText: transcription
        }
    } catch(err){
        return {
            transcriptText: '',
            error: 'failRecognize'
        }
    }

   
}