const http = require('http')
const express = require('express')
const app = express()
//const cors = require('cors')
const path = require('path');
const mongoose = require('mongoose')
var bodyParser = require('body-parser')

app.use(bodyParser.json())
const reservationRouter = require(`./controllers/reservation.js`)

require('dotenv').config()

const mongoUrl = process.env.MONGO 

mongoose.connect(mongoUrl, {
    useCreateIndex: true,
    useUnifiedTopology:true,
    useNewUrlParser:true,
    useFindAndModify:false
    })

//app.use(cors())
app.use(express.json())
app.use(express.static('build'))




app.use('/api/reservation', reservationRouter)



app.get('*', (req,res) =>{

  res.send("Page not found")
 
});

const PORT =  process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})