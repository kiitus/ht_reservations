const mongoose = require('mongoose')


const reservationSchema = mongoose.Schema({
    Room: {
        type: String,
    required: true
    },
    Times: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:"time",
        required:true
    }]
})

    reservationSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })


  

  module.exports = mongoose.model('Reservation', reservationSchema)