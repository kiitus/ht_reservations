const reservationRouter = require('express').Router()
const time = require('../models/time')
//require('dotenv').config()

let convertAndGather = (findResult) =>{
    const converted = []
    findResult.forEach((time) => {
        let oneReservation = {
            room: time.Room,
            startTime: new Date(time.Starttime).toLocaleString(),
            endTime: new Date(time.Endtime).toLocaleString(),
            user: time.User,
            id: time._id
        }

        converted.push(oneReservation)
    })
    return converted
}


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
    console.log(id)
    time.findByIdAndDelete(id).then((deleted) =>
    {
        res.end("Reservation deleted")
    }).catch((error)=>{
        res.end("Error in id")
    })
})

reservationRouter.get("/",(req,res)=>
{
    let result = []
 
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

        let alku = "$gte"
        let loppu = "$lt"
        let Starttime2 = {}
        Starttime2[alku] = s
        Starttime2[loppu] = e
        let title2 = "Starttime";
        /*
        let valueAlku = 1602806400000
        let valueLoppu = 1602892800000*/
        query[title2] = Starttime2;

    }


    if(req.query.user !== undefined)
    {
        let titleUser = "User";
        let valueUser = req.query.user;
        query[titleUser] = valueUser;
    }
    console.log(query)
    //Starttime: { $gte: s , $lt: e }
    //1602806400000
    //1602892800000
    time.find(query).sort({ Room: 1, Starttime: 1 }).then((finded) => {
        result =convertAndGather(finded)
        return res.send(result)
        })
})
/*
reservationRouter.get('/', (req, res) => {

    let result = []
    time.find({}).sort({ Room: 1, Starttime: 1 }).then((finded) => {
        result =convertAndGather(finded)
        return res.send(result)
        })
})
*/

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

//hour+3
  /*  let s = new Date(year, month - 1, day, hour)
    let e = new Date(year, month - 1, day, (hour) + duration)

    console.log(s)
    console.log(e)

*/
    let startMil = new Date(year, month - 1, day, hour).getTime()
    let endMil = new Date(year, month - 1, day, hour + duration).getTime()

    time.find({ Room: room }).then((finded_room) => {

        if (isNaN(startMil) || isNaN(endMil)) {
            console.log("Nan")
            return res.end("Daytime error")
        }


        if (finded_room.length === 0) {
            console.log("Täällä")
            const time_var = new time({
                Room: room,
                Starttime: startMil,
                Endtime: endMil,
                User:user
            })
            time_var.save().then((saved_time) => {
                return res.send(saved_time)
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
                    return res.send(saved_time)
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
      return  res.end("Error in reservation time")
    }
    let reserved = false
    time.find({Room:data.Room}).then((founded)=>
     {
         console.log("PÖö")
        
        reserved = isReserved(data.Starttime,data.Endtime,founded,id)
        
        if(!reserved)
        {
            
            time.replaceOne({ _id: id }, data).then((modified)=>{
                console.log(modified.n)
                if(modified.n)
                {
                    time.findById(id).then((founded)=>
                    {
                        res.send(founded)
                    })
                }
                else
                {
                    res.end("ID error")
                }}).catch((error)=>
                {
                    res.send("Error in id")
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
        let orginalStartTime = new Date(timeToUpdate.Starttime)
        console.log(orginalStartTime)
        let year = orginalStartTime.getFullYear()
        let month = orginalStartTime.getMonth() +1
        let day = orginalStartTime.getDate() 
        let hour = orginalStartTime.getHours()

        if(body.year !== undefined)
        year = body.year

        if(body.month !== undefined)
        month = body.month

        if(body.day !== undefined)
        day = body.day
        
        if(body.hour !== undefined)
        hour = body.hour

        console.log("year "+year)
        console.log("month "+month)
        console.log("day "+day)
        console.log("hour "+hour)
        console.log(new Date(parseInt(year),parseInt(month) - 1, parseInt(day), parseInt(hour)))
      let startMil = new Date(parseInt(year),parseInt(month) - 1, parseInt(day), parseInt(hour)).getTime()
            
     
     let endMil
        if(body.duration !== undefined)
        endMil = new Date(parseInt(year),parseInt(month) - 1,parseInt( day), (parseInt(hour)) + parseInt(body.duration)).getTime()
        else
        endMil = startMil + (timeToUpdate.Endtime - timeToUpdate.Starttime)

       
        if( isNaN(startMil) || isNaN(endMil) )
        return  res.end("Error in reservation time")


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
        data.User = timeToUpdate.user
        
        
    let reserved = false
    time.find({Room:data.Room}).then((founded)=>
     {
        console.log("jeejee")
        reserved = isReserved(data.Starttime,data.Endtime,founded,id)
        
        if(!reserved)
        {
            time.findByIdAndUpdate(id, data, { new: true }).then((modified)=>{
            res.send(modified)
            }).catch((error)=>
            {
                res.send("Error in id")
            })
            
        }
        else
        {
            return res.end("Room was reserved")
        }
    })
})

    
})

module.exports = reservationRouter