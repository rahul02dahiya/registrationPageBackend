const express = require('express')
const connectToMongo = require('./db')
const cors = require('cors')
const app = express()
const port = 5000

connectToMongo();
app.use(cors());
app.use(express.json())

app.use('/api/auth',require('./routes/auth'));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})