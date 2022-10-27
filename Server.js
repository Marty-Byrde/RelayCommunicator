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

        if(message === process.env.relayStation) connections.relayStation = socket;
        else if (message === process.env.receiver) {
            if(!connections.receivers.find(r => r === socket)) connections.receivers.push(socket); // add new clients
        }
        else {
            socket.emit(process.env.authentificationEvent, "Access denied!")
        }

        console.log("Client has successfully authenticated!")
    })

    socket.on(process.env.dataEvent, data => {
        console.log(`Transmitting data to receivers!`)

        let route = data.params.route ? data.params.route.replace(/"/g, '') : process.env.dataEvent

        for(let client of connections.receivers){
            client.emit(route, data)
        }
    })
})