import express from 'express'
import MyGame from './dog2.js'
const app = express()
const port = 3000

app.get('/', MyGame)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})