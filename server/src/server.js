const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 2000;
const http = require('http');

// Set static folder
app.use(express.static(path.join(__dirname, "../public")));

const server = http.createServer(app);
const io = require('socket.io')(server);

// Track the joining players
let players = [];

// correct result
let result = 0;
let raceInProgress = false; 

// When a client connects
io.on('connection', socket => {

    console.log('Client connected');
    // We will respond from the server and welcome the player
    socket.emit('message', 'Welcome to math race game');

    socket.on('playerJoin', message => {
        // object deconstruction
        const { player } = JSON.parse(message);
        newPlayer(player, socket, io);
    });

    socket.on('chatMessage', chatMessage => {
        const data = JSON.parse(chatMessage);
        console.log(chatMessage);
        io.sockets.emit('chatMessageBroadcast', JSON.stringify({
            chatMessage:data
        }))

        if (!!data.msg && Number.isInteger(Number(data.msg))) {
            console.log("checking result of :"+data.player);
            if (Number(data.msg) == result) {
                let pAux = null;
                for (const p of players) {
                    if (p.player == data.player) {
                        p.distance += 1;
                        pAux = p;
                    }
                }

                if (pAux.distance > 10) {
                    io.sockets.emit('winnerBroadcast', JSON.stringify({
                        player:pAux, players
                    }))
                } else { 
                    io.sockets.emit('playerMoveBroadcast', JSON.stringify({
                        player:pAux, players
                    }))
    
                    let op = generateOperation();
                    result = op.num1*op.num2;
                    io.sockets.emit('operationBroadcast', JSON.stringify({
                        operation:`${op.num1} X ${op.num2} =`
                    }))
                }
                
            }
        }
    });

    socket.on('startRace', player => {
        const data = JSON.parse(player);
        console.log(player);
        raceInProgress = true;
        io.sockets.emit('startBroadcast', JSON.stringify({
            player
        }), raceInProgress)
        
        let op = generateOperation();
        result = op.num1*op.num2;
        io.sockets.emit('operationBroadcast', JSON.stringify({
            operation:`${op.num1} X ${op.num2} =`
        }))    
    });

    socket.on('restartRace', player => {
        const data = JSON.parse(player);
        console.log(player);

        for (const p of players) {
            p.distance += 1;
        }

        io.sockets.emit('restartBroadcast', JSON.stringify({
            player, players
        }))
        
    });

    socket.on('disconnect', () => {
        players = players.filter(u => u.id != socket.id);
        io.sockets.emit('playerDisconnect', JSON.stringify({
            id: socket.id
        }));
    });
});

const newPlayer = (player, socket, io) => {
    if(raceInProgress) {
        socket.emit('playerJoined', 'Race started');
        return
    }
    
    for(const p of players) {
        if(player == p.player) {
            socket.emit('playerJoined', 'Invalid username');
            return
        }
    }
    players.push({ player, id: socket.id, distance: 1 });
    console.log(players);
    socket.emit('playerJoined', 'You are now joined');
    io.sockets.emit('playerList', JSON.stringify({
        player, players
    }));
}

const generateOperation = () => { 
    let num1, num2;
    num1 = randomIntFromInterval(1,9);
    num2 = randomIntFromInterval(1,9);
    return {num1,num2}
}

const randomIntFromInterval = (min, max) => { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

