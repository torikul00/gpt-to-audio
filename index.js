
const express = require('express')
const cors = require('cors')
const textToSpeech = require('@google-cloud/text-to-speech')
require('dotenv').config()
const fs = require('fs')
const util = require('util')
const path = require('path')
const { OpenAI } = require('openai')
const port = process.env.PORT || 3000

// middleware
const app = express()
app.use(cors())
app.use(express.json())
const client = new textToSpeech.TextToSpeechClient();

const openai = new OpenAI({
    apiKey: process.env.API_KEY
})


app.post('/texttospeech', async (req, res) => {

    const text = req.body.text;
    const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: text }],
        model: 'gpt-3.5-turbo',
    });

    const gptResponseText =  completion.choices[0].message.content
  

  
    const request = {

        input: { text: gptResponseText },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },

    };
    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('output.mp3', response.audioContent, 'binary');

    const options = {
        root: path.join(__dirname)
    };
    const fileName = 'output.mp3';

    res.sendFile(fileName, options, (err) => {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    })



})



app.get('/', (req, res) => {
    res.send('Text to speech server running')
})
app.listen(port, () => console.log('server running on port 3000'))

