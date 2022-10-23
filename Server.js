const path = require("path")
require('dotenv').config({ path: path.join(__dirname, ".env") })
const colors = require("colors");

const { Server } = require("socket.io")
const io = new Server(process.env.PORT)

const connections = {
    relayStation: null,
    receivers: []
}

io.on(process.env.newClient, socket => {
    socket.emit(process.env.connectionEvent, "Authentication required to continue!")

    socket.on(process.env.authentificationEvent, message => {
        console.log(`Client has authenticated as: ${message}`)

        if(message === process.env.relayStation) connections.relayStation = socket;
        else if (message === process.env.receiver) connections.receivers = socket;
        else {
            socket.emit(process.env.authentificationEvent, "Access denied!")
            socket.close();
        }
    })

    socket.on(process.env.dataEvent, data => {
        console.log(`Transmitting data to receivers!`)

        for(let client of connections.receivers){
            client.emit(process.env.dataEvent, data)
        }
    })
})