const http = require('http')
const express = require('express')
const app = express()
//const cors = require('cors')
const path = require('path');
const mongoose = require('mongoose')

const reservationRouter = require(`./controllers/reservation.js`)

//require('dotenv').config()

const mongoUrl = process.env.MONGO || 'mongodb+srv://kiitus:m2f69JomE4CdMcSP@cluster0-ppj5g.mongodb.net/Movies?retryWrites=true&w=majority'

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

  res.sendFile(path.join(__dirname+'/build/index.html'));
 
});

const PORT =  process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})