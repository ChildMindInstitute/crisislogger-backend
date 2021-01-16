import express from 'express'
import cors from 'cors'
import fileUpload  from 'express-fileupload'
import './envConfigurate'
import db from './src/database/index'
import fs from 'fs'
import bodyParser from 'body-parser'
import userRouter from './src/routes/user.routes'
import fileRouter from './src/routes/file.routes'
import conversionRouter from './src/routes/conversion.routes'
import conversionMiddleware from './src/middleware/conversionQuery.middleware'
import { processFailedUploads } from './src/handlers/file.handlers'
const cron = require('node-cron');
const app = express()

app.use(fileUpload({
    createParentPath: true
}))

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '500mb', extended: false }))

app.use('/users', userRouter)
app.use('/file', fileRouter)
app.use('/conversion', conversionMiddleware,  conversionRouter)
cron.schedule('* * * * *', function() {
    console.log('---------------------');
    console.log('Running Cron Job');
    processFailedUploads()
  });
app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server strart on port ${process.env.SERVER_PORT}`)
})