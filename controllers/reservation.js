const reservationRouter = require('express').Router()
const time = require('../models/time')
//require('dotenv').config()

//Muuttaa ohjelman käyttämät millisekunnit tavalliseksi ajaksi
let convertAndGather = (resultToConvert) =>{
    
    const converted = []
   
    if(Array.isArray(resultToConvert))
    {
    resultToConvert.forEach((time) => {
        let oneReservation = {
            room: time.Room,
            startTime: new Date(time.Starttime).toLocaleString(),
            endTime: new Date(time.Endtime).toLocaleString(),
            user: time.User,
            id: time._id
        }

        converted.push(oneReservation)
    })
}else
{
    let oneReservation = {
        room: resultToConvert.Room,
        startTime: new Date(resultToConvert.Starttime).toLocaleString(),
        endTime: new Date(resultToConvert.Endtime).toLocaleString(),
        user: resultToConvert.User,
        id: resultToConvert._id
    }
    converted.push(oneReservation)
}
    return converted
}

//Tarkistaa onko luokka varattu, skipillä toteutetaan
//ettei muokattava vaikuta omaan tarkastukseensa
let isReserved = (startMil,endMil,times,skip = 0)=>
{
    let reserved = false
    times.forEach((time)=>
    {  

    if(String(time._id) !== skip)
    {
    if ((time.Starttime <= startMil) && (startMil < time.Endtime)) {
        reserved = true

    }
    else if ((time.Starttime < endMil) && (endMil <= time.Endtime)) {
        reserved = true
       

    }
    else if ((startMil <= time.Starttime) && (time.Starttime < endMil)) {
        reserved = true
    

    }
    else if ((startMil < time.Endtime) && (time.Endtime <= endMil)) {
        reserved = true
    

    }}})
    return reserved
}

reservationRouter.delete("/:id",(req,res)=>
{

    const id = req.params.id

    time.findByIdAndDelete(id).then((deleted) =>
    {
        res.send("Reservation deleted")
    }).catch((error)=>{
        res.status(400).send("Error in id")
    })
})

reservationRouter.get("/",(req,res)=>
{
    //Tähän kerätään hakuehdot
    let query = {};
    if(req.query.room !== undefined)
    {
    let title = "Room";
    let value = req.query.room;
    query[title] = value;
    }


    let date =req.query.date
    if(date !== undefined && date.length ===8 )
    {
    const day = parseInt(req.query.date.substring(0,2))
    const month = parseInt(req.query.date.substring(2,4))
    const year = parseInt(req.query.date.substring(4,8))

    
    let s = new Date(year, month - 1, day)
    let e = new Date(year, month - 1, day+1)

        let beginning = "$gte"
        let end = "$lt"
        let Starttime2 = {}
        Starttime2[beginning] = s
        Starttime2[end] = e
        let title2 = "Starttime";
        
        //Starttime: { $gte: s , $lt: e }
   
        query[title2] = Starttime2;

    }


    if(req.query.user !== undefined)
    {
        let titleUser = "User";
        let valueUser = req.query.user;
        query[titleUser] = valueUser;
    }
    console.log(query)
  


    let result = []
 
    time.find(query).sort({ Room: 1, Starttime: 1 }).then((finded) => {
        result =convertAndGather(finded)
        return res.send(result)
        })
})


reservationRouter.get('/:room', (req, res) =>
{

    let roomFromPara = req.params.room
    
    let result = []
    time.find({Room: roomFromPara}).sort({ Room: 1, Starttime: 1 }).then((finded) => {
        result =convertAndGather(finded)
        return res.send(result)
        })

})

reservationRouter.get('/:room/date/:date', (req, res) =>
{

    let roomFromPara = req.params.room
    
    
    const day = parseInt(req.params.date.substring(0,2))
    const month = parseInt(req.params.date.substring(2,4))
    const year = parseInt(req.params.date.substring(4,8))

    
    let s = new Date(year, month - 1, day)
    let e = new Date(year, month - 1, day+1)

    console.log(s)
    console.log(e)

    let result = []
    time.find({Room: roomFromPara,Starttime: { $gte: s , $lt: e } }).sort({ Room: 1, Starttime: 1 }).then((finded) => {
        result =convertAndGather(finded)
        return res.send(result)

    }
    )

})






reservationRouter.post("/", (req, res) => {
    const room = req.body.room
    const year = parseInt(req.body.year)
    const month = parseInt(req.body.month)
    const day = parseInt(req.body.day)
    const hour = parseInt(req.body.hour)
    const duration = parseInt(req.body.duration)
    const user =req.body.user



    let startMil = new Date(year, month - 1, day, hour).getTime()
    let endMil = new Date(year, month - 1, day, hour + duration).getTime()

    time.find({ Room: room }).then((finded_room) => {

        if (isNaN(startMil) || isNaN(endMil)) {
            return res.status(400).send("Error in reservation time")
        }


        if (finded_room.length === 0) {

            const time_var = new time({
                Room: room,
                Starttime: startMil,
                Endtime: endMil,
                User:user
            })
            time_var.save().then((saved_time) => {
                let converted = convertAndGather(saved_time)
                return res.send(converted)
            }).catch((error)=>
            {
                res.status(400).send(error.message)
            })

        }
        else {
            let reserved = false;
              reserved = isReserved(startMil,endMil,finded_room)
            if (reserved === false) {
                const time_var = new time({
                    Room: room,
                    Starttime: startMil,
                    Endtime: endMil,
                    User: user
                })
                time_var.save().then((saved_time) => {
                    let converted = convertAndGather(saved_time)
                    return res.send(converted)
                }).catch((error)=>
                {
                    res.status(400).send(error.message)
                })
            }
            else{
                return res.end("Room was reserved")
            }
        }

    })

})


reservationRouter.put("/:id",(req,res)=>
{

    let id = req.params.id
    let startMil = new Date(parseInt(req.body.year),parseInt(req.body.month) - 1, parseInt(req.body.day), parseInt(req.body.hour)).getTime()
    let endMil = new Date(parseInt(req.body.year),parseInt(req.body.month) - 1,parseInt( req.body.day), parseInt(req.body.hour) + parseInt(req.body.duration)).getTime()

    data = {
        Room: req.body.room,
        Starttime: startMil,
        Endtime: endMil,
        User: req.body.user
    }

    if(isNaN(data.Starttime) || isNaN(data.Endtime) || data.Room === undefined)
    {
      return  res.status(400).send("eError in reservation time")
    }
    let reserved = false
    time.find({Room:data.Room}).then((founded)=>
     {
        
        reserved = isReserved(data.Starttime,data.Endtime,founded,id)
        
        if(!reserved)
        {
            
            time.replaceOne({ _id: id }, data).then((modified)=>{
                console.log(modified.n)
                if(modified.n)
                {
                    time.findById(id).then((founded)=>
                    {
                        let converted = convertAndGather(founded)
                        return res.send(converted)
                    })
                }
                else
                {
                    res.status(400).send("ID error")
                }}).catch((error)=>
                {
                    res.status(400).send("Error in id")
                })
            
        }
        else
        {
            return res.end("Room was reserved")
        }
    })
    
})

reservationRouter.patch("/:id",(req,res)=>
{

    let id = req.params.id
    let body = req.body

    time.findById(id).then((timeToUpdate)=>
    {
        //Ladataan muokattavan varauksen alkuperäiset arvot
        let orginalStartTime = new Date(timeToUpdate.Starttime)
        
        let year = orginalStartTime.getFullYear()
        let month = orginalStartTime.getMonth() +1
        let day = orginalStartTime.getDate() 
        let hour = orginalStartTime.getHours()

        //Muokattavat arvot
        if(body.year !== undefined)
        year = body.year

        if(body.month !== undefined)
        month = body.month

        if(body.day !== undefined)
        day = body.day
        
        if(body.hour !== undefined)
        hour = body.hour

        
      let startMil = new Date(parseInt(year),parseInt(month) - 1, parseInt(day), parseInt(hour)).getTime()
            
     //Varauksen lopetus aika
     let endMil
     //Jos muokataan
        if(body.duration !== undefined)
        endMil = new Date(parseInt(year),parseInt(month) - 1,parseInt( day), (parseInt(hour)) + parseInt(body.duration)).getTime()
    //Jos ei muokata 
        else
        endMil = startMil + (timeToUpdate.Endtime - timeToUpdate.Starttime)

       
        if( isNaN(startMil) || isNaN(endMil) )
        return  res.status(400).send("Error in reservation time")


        data = {
            Room: req.body.room,
            Starttime: startMil,
            Endtime: endMil
        }

        if(data.Room == null)
        data.Room = timeToUpdate.Room
        
        if(body.user !== undefined)
        data.User = body.user
        else
        data.User = timeToUpdate.User
        
        
    let reserved = false
    time.find({Room:data.Room}).then((founded)=>
     {
        reserved = isReserved(data.Starttime,data.Endtime,founded,id)
        
        if(!reserved)
        {
            time.findByIdAndUpdate(id, data, { new: true }).then((modified)=>{
                let converted = convertAndGather(modified)
                return res.send(converted)
            }).catch((error)=>
            {
                res.status(400).send("Not reservation in given ID")
            })
            
        }
        else
        {
            return res.send("Room was reserved")
        }
    })
}).catch((error)=>
{
    res.status(400).send('Id was wrong ')
})

    
})

module.exports = reservationRouter