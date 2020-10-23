const http = require('http')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
var bodyParser = require('body-parser')
const cors = require('cors')


app.use(cors())
app.use(bodyParser.json())

app.use((err, req, res, next) => {
  if (err) {
    res.status(400).send('error parsing data')
  } else {
    next()
  }
})


const reservationRouter = require(`./controllers/reservation.js`)

require('dotenv').config()

const mongoUrl = process.env.MONGO 

mongoose.connect(mongoUrl, {
    useCreateIndex: true,
    useUnifiedTopology:true,
    useNewUrlParser:true,
    useFindAndModify:false
    })


app.use(express.json())


app.use('/reservation', reservationRouter)



app.get('*', (req,res) =>{

  res.send("Page not found")
 
});

const PORT =  process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})