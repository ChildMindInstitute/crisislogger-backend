import express from 'express'
import './envConfigurate'
import db from './src/database/index'
import bodyParser from 'body-parser'
import userRouter from './src/routes/user.routes'


const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/users', userRouter)

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server strart on port ${process.env.SERVER_PORT}`)
})