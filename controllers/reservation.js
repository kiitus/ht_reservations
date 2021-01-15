const reservationRouter = require('express').Router()
const time = require('../models/time')



//Muuttaa ohjelman käyttämät millisekunnit tavalliseksi ajaksi
let convertAndGather = (resultToConvert) => {

    const converted = []

    if (Array.isArray(resultToConvert)) {
        //Jos array
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

    }
    else {
        //Jos yksittäinen object
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
//ettei muokattavan varauksen vanha aika vaikuta tarkastuksessa
let isReserved = (startMil, endMil, times, skip = 0) => {
    
    let reserved = false

    times.forEach((time) => {

        if (String(time._id) !== skip) {
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


            }
        }
    })
    return reserved
}

reservationRouter.delete("/:id", (req, res) => {

    const id = req.params.id

    time.findByIdAndDelete(id).then((deleted) => {
        res.send("Reservation deleted")
    }).catch((error) => {
        res.status(400).send("Error in id")
    })
})

reservationRouter.get("", (req, res) => {
    

    //Tähän kerätään hakuehdot
    let query = {};
    

    let room = req.query.room

    if (room !== undefined  && room.trim()!=="" ) {
        let title = "Room";
        let value = req.query.room.trim();
        query[title] = value;
    }

   
    //Päiväys pitää olla muodossa ddmmyyyy

    let date = req.query.date
    let searchDay = req.query.searchDay 
    if (date !== undefined && date.length === 10 && searchDay === "etsi" ) {
        const day = parseInt(req.query.date.substring(8, 10))
        const month = parseInt(req.query.date.substring(5, 7))
        const year = parseInt(req.query.date.substring(0, 4))

        console.log(day)
        console.log(month)
        console.log(year)
        //Näytetään yhden päivän varaukset

        let s = new Date(year, month - 1, day)
        let e = new Date(year, month - 1, day + 1)

        let beginning = "$gte"
        let end = "$lt"
        let Starttime2 = {}
        Starttime2[beginning] = s
        Starttime2[end] = e
        let title2 = "Starttime";

        //Starttime: { $gte: s , $lt: e }

        query[title2] = Starttime2;

    }


    if (req.query.user !== undefined && req.query.user.trim() != "") {
        let titleUser = "User";
        let valueUser = req.query.user.trim();
        query[titleUser] = valueUser;
    }
    
    console.log(query)



    let result = []

    time.find(query).sort({ Room: 1, Starttime: 1 }).then((finded) => {
        result = convertAndGather(finded)
        return res.send(result)
    })
})


reservationRouter.get('/:room', (req, res) => {

    let roomFromPara = req.params.room

    let result = []
    time.find({ Room: roomFromPara }).sort({ Room: 1, Starttime: 1 }).then((finded) => {
        result = convertAndGather(finded)
        return res.send(result)
    })

})

reservationRouter.get('/:room/date/:date', (req, res) => {

    let roomFromPara = req.params.room

    //Date pitää olla muodossa ddmmyyyy

    const day = parseInt(req.params.date.substring(0, 2))
    const month = parseInt(req.params.date.substring(2, 4))
    const year = parseInt(req.params.date.substring(4, 8))


    let s = new Date(year, month - 1, day)
    let e = new Date(year, month - 1, day + 1)

    console.log(s)
    console.log(e)

    let result = []
    
    //Hakee tietyn huoneen tietyn päivän varaukset
    time.find({ Room: roomFromPara, Starttime: { $gte: s, $lt: e } }).sort({ Room: 1, Starttime: 1 }).then((finded) => {
        result = convertAndGather(finded)
        return res.send(result)

    }
    )

})






reservationRouter.post("/", (req, res) => {

    var d = new Date(req.body.reservation);

    const room = req.body.room
  // const year = parseInt(req.body.year)
  //  const month = parseInt(req.body.month)
  //  const day = parseInt(req.body.day)
    const year = d.getFullYear()
    const month = d.getMonth() +1
     const day =d.getDate()
    const hour = parseInt(req.body.hour)
    const duration = parseInt(req.body.duration)
    const user = req.body.user


    //Varatut ajat millisekunteina
    let startMil = new Date(year, month - 1, day, hour).getTime()
    let endMil = new Date(year, month - 1, day, hour + duration).getTime()



    //Jos syötteessä virhe
    if (isNaN(startMil) || isNaN(endMil) || (endMil < startMil)) {
        return res.status(400).send("Error in reservation time")
    }

    time.find({ Room: room }).then((finded_room) => {

        //Tarkistetaan onko huone varattu
        let reserved = false;
        reserved = isReserved(startMil, endMil, finded_room)
       
        if (reserved === false) {
            //luodaan uusi varaus
            const time_var = new time({
                Room: room,
                Starttime: startMil,
                Endtime: endMil,
                User: user
            })

            time_var.save().then((saved_time) => {
                let converted = convertAndGather(saved_time)
                console.log(converted)
                return res.send(converted)
            }).catch((error) => {
                res.status(400).send(error.message)
            })
        }
        else {
            return res.end("Room was reserved")
        }
    })

})


reservationRouter.put("/:id", (req, res) => {

    let id = req.params.id

    //Ajat millisekunteina
    let startMil = new Date(parseInt(req.body.year), parseInt(req.body.month) - 1, parseInt(req.body.day), parseInt(req.body.hour)).getTime()
    let endMil = new Date(parseInt(req.body.year), parseInt(req.body.month) - 1, parseInt(req.body.day), parseInt(req.body.hour) + parseInt(req.body.duration)).getTime()

    //Syötteen tiedot objektiin
    data = {
        Room: req.body.room,
        Starttime: startMil,
        Endtime: endMil,
        User: req.body.user
    }

    //Jos virheitä syötteessä
    if (isNaN(data.Starttime) || isNaN(data.Endtime) || (data.Room === undefined) || (data.Endtime < data.Starttime)) {
        return res.status(400).send("Error in reservation time")
    }


    let reserved = false
    time.find({ Room: data.Room }).then((founded) => {
        //Tarkistetaan onko huone varattu
        reserved = isReserved(data.Starttime, data.Endtime, founded, id)

        if (!reserved) {
            //Korvataan varaus uudella
            time.replaceOne({ _id: id }, data).then((modified) => {
                console.log(modified.n)
                if (modified.n) {
                    time.findById(id).then((founded) => {
                        let converted = convertAndGather(founded)
                        return res.send(converted)
                    })
                }
                else {
                    res.status(400).send("ID error")
                }
            }).catch((error) => {
                res.status(400).send("Error in id")
            })

        }
        else {
            return res.end("Room was reserved")
        }
    })

})

reservationRouter.patch("/:id", (req, res) => {

    let id = req.params.id
    let body = req.body

    time.findById(id).then((timeToUpdate) => {
        //Ladataan muokattavan varauksen alkuperäiset arvot
        let orginalStartTime = new Date(timeToUpdate.Starttime)

        let year = orginalStartTime.getFullYear()
        let month = orginalStartTime.getMonth() + 1
        let day = orginalStartTime.getDate()
        let hour = orginalStartTime.getHours()

        //Muokattavat arvot
        if (body.year !== undefined)
            year = body.year

        if (body.month !== undefined)
            month = body.month

        if (body.day !== undefined)
            day = body.day

        if (body.hour !== undefined)
            hour = body.hour


        let startMil = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour)).getTime()

        //Varauksen lopetus aika
        let endMil
        //Jos muokataan
        if (body.duration !== undefined)
            endMil = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), (parseInt(hour)) + parseInt(body.duration)).getTime()
        //Jos ei muokata 
        else
            endMil = startMil + (timeToUpdate.Endtime - timeToUpdate.Starttime)


            //Onko  syötteessä virheitä
        if (isNaN(startMil) || isNaN(endMil) || (endMil < startMil))
            return res.status(400).send("Error in reservation time")

        //Syötteet objektiin
        data = {
            Room: req.body.room,
            Starttime: startMil,
            Endtime: endMil
        }

        //jos ei anneta roomia käyetään vanhaa
        if (data.Room == null)
            data.Room = timeToUpdate.Room


        //jos ei anneta useria käytetään vanhaa
        if (body.user !== undefined)
            data.User = body.user
        else
            data.User = timeToUpdate.User


        let reserved = false
        time.find({ Room: data.Room }).then((founded) => {
            //Onko huone varattu
            reserved = isReserved(data.Starttime, data.Endtime, founded, id)

            if (!reserved) {
                //Päivitetään varausta
                time.findByIdAndUpdate(id, data, { new: true }).then((modified) => {
                    let converted = convertAndGather(modified)
                    return res.send(converted)
                }).catch((error) => {
                    res.status(400).send("Not reservation in given ID")
                })

            }
            else {
                return res.send("Room was reserved")
            }
        })
    }).catch((error) => {
        res.status(400).send('Id was wrong ')
    })


})

module.exports = reservationRouter