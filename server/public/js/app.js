console.log('Ready');

const q = selector => document.querySelector(selector);

const frm = q('#frm');
const playerDiv = q('#player');
const playersList = q('#playerList');
const chatDiv = q('#chat');
const txtPlayer = q('#txtPlayer');
const idPlayer = q('#idPlayer');
const btnLeave = q('#btnLeave');
const btnSend = q('#btnSend');
const txtChat = q('#txtChat');
const chatcontainer = q('#chatcontainer');
const btnRestart  = q('#btnRestart');
const btnStart    = q('#btnStart');
const resultDiv   = q('#result');
const raceDiv     = q('#race');
const waitingDiv  = q('#waiting');
const operationDiv  = q('#operation');
const resultTextDiv  = q('#resultText');

let socket   = {};
let playerList = [];

frm.addEventListener('submit', e => {
    e.preventDefault();

    socket = io();// connect to the socket server

    socket.on('message', message => {
        console.log(message);
    });

    socket.emit('playerJoin', JSON.stringify(
        { player: txtPlayer.value.trim() }
    ));

    socket.on('playerJoined', message => {
        console.log(message);
        playerDiv.classList.toggle('hide');
        chatDiv.classList.toggle('hide');
    });

    socket.on('playerList', playerList => {
        const data = JSON.parse(playerList);
        console.log(data);
        playerJoin(data.player);
        loadPlayers(data.players);
    });

    socket.on('chatMessageBroadcast', msg => {
        console.log(msg);
        const { chatMessage } = JSON.parse(msg);
        chatcontainer.innerHTML += `<div><p>${chatMessage.player} 
        says: ${chatMessage.msg}</p></div>`;
    });

    socket.on('operationBroadcast', msg => {
        console.log(msg);
        const { operation } = JSON.parse(msg);
        operationDiv.innerHTML = operation;
    });

    socket.on('startBroadcast', msg => {
        console.log(msg);
        waitingDiv.classList.remove('hide');
        resultDiv.classList.remove('hide');
        raceDiv.classList.remove('hide');
        waitingDiv.classList.add('hide');
        resultDiv.classList.add('hide');
    });

    socket.on('playerMoveBroadcast', msg => {
        console.log(msg);
        const { player, players } = JSON.parse(msg);
        playerList = players;
        let tDiv = q('#'+player.id);
        tDiv.classList.remove("t_pos_"+(player.distance-1));
        tDiv.classList.add("t_pos_"+player.distance);
    });

    socket.on('winnerBroadcast', msg => {
        console.log(msg);
        const { player, players } = JSON.parse(msg);
        playerList = players;
        waitingDiv.classList.remove('hide');
        resultDiv.classList.remove('hide');
        raceDiv.classList.remove('hide');
        waitingDiv.classList.add('hide');
        raceDiv.classList.add('hide');
        resultTextDiv.innerHTML=player.player+" Won!! "
    });
    socket.on('restartBroadcast', msg => {
        console.log(msg);
        const { player, players } = JSON.parse(msg);
        playerList = players;
        waitingDiv.classList.remove('hide');
        resultDiv.classList.remove('hide');
        raceDiv.classList.remove('hide');
        resultDiv.classList.add('hide');
        raceDiv.classList.add('hide');
        loadPlayers(playerList);
    });

    socket.on('playerDisconnect', disconnectedPlayer => {
        player = JSON.parse(disconnectedPlayer);
        let leavingPlayer = playerList.find(u => u.id == player.id);

        playerList = playerList.filter(u => u.id != player.id);
        loadPlayers(playerList);
        playerLeft(leavingPlayer);
    });
});

btnLeave.onclick = e => {
    playerDiv.classList.toggle('hide');
    chatDiv.classList.toggle('hide');
    waitingDiv.classList.remove('hide');
    raceDiv.classList.add('hide');
    resultDiv.classList.add('hide');
    txtPlayer.value = '';
    txtChat.value = '';

    socket.disconnect();
}

btnSend.onclick = e => {
    const msg = txtChat.value;
    txtChat.value = '';

    socket.emit('chatMessage', JSON.stringify({
        player: txtPlayer.value, msg
    }))
}

btnStart.onclick = e => {
    waitingDiv.classList.toggle('hide');
    raceDiv.classList.toggle('hide');
    //resultDiv.classList.toggle('hide');
    socket.emit('startRace', JSON.stringify({
        player: txtPlayer.value
    }))
}

btnRestart.onclick = e => {
    //raceDiv.classList.toggle('hide');
    waitingDiv.classList.toggle('hide');
    resultDiv.classList.toggle('hide');
    socket.emit('restartRace', JSON.stringify({
        player: txtPlayer.value
    }))
}

const playerLeft = player => {
    chatcontainer.innerHTML += `<div class="leftChat">${player.player} has left the chat</div>`
}


const playerJoin = player => {
    chatcontainer.innerHTML += `<div>${player} has joined</div>`;
}

const loadPlayers = players => {
    playersList.innerHTML = '';
    playerList = players;
    let i = 1;
    for (const p of players) {
        playersList.innerHTML += `<div class="line">
                                    <div class="p_name">
                                        <p class="p_title">Player ${i}</p>
                                        <p class="p_nick">${p.player}</p>
                                    </div>
                                    <div class="p_line"><div id="${p.id}" class="turtle t_pos_1"></div></div>
                                    <div class="p_goal"></div>
                                </div>`;
                                i++;
    }
}