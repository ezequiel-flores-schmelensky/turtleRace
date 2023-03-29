console.log('Ready');

const q = selector => document.querySelector(selector);

const frm = q('#frm');
const userDiv = q('#user');
const usersList = q('#userList');
const chatDiv = q('#chat');
const txtUser = q('#txtUser');
const btnLeave = q('#btnLeave');
const btnSend = q('#btnSend');
const txtChat = q('#txtChat');
const chatcontainer = q('#chatcontainer');

let socket   = {};
let userList = [];

frm.addEventListener('submit', e => {
    e.preventDefault();

    socket = io();// connect to the socket server

    socket.on('message', message => {
        console.log(message);
    });

    socket.emit('userJoin', JSON.stringify(
        { user: txtUser.value.trim() }
    ));

    socket.on('userJoined', message => {
        console.log(message);
        userDiv.classList.toggle('hide');
        chatDiv.classList.toggle('hide');
    });

    socket.on('userList', userList => {
        const data = JSON.parse(userList);
        console.log(data);
        userJoin(data.user);
        loadUsers(data.users);
    });

    socket.on('chatMessageBroadcast', msg => {
        console.log(msg);
        const { chatMessage } = JSON.parse(msg);
        chatcontainer.innerHTML += `<div><p>${chatMessage.user} 
        says: ${chatMessage.msg}</p><p>Sent at: ${new Date()}</p></div>`;
    });

    socket.on('userDisconnect', disconnectedUser => {
        user = JSON.parse(disconnectedUser);
        let leavingUser = userList.find(u => u.id == user.id);

        userList = userList.filter(u => u.id != user.id);
        loadUsers(userList);
        userLeft(leavingUser);
    });
});

const userLeft = user => {
    chatcontainer.innerHTML += `<div class="leftChat">${user.user} has left the chat</div>`
}


const userJoin = user => {
    chatcontainer.innerHTML += `<div>${user} has joined chat at ${new Date()}</div>`;
}

const loadUsers = users => {
    usersList.innerHTML = '';
    userList = users;

    for (const u of users) {
        usersList.innerHTML += `<span>${u.user}</span>`;
    }
}

btnLeave.onclick = e => {
    userDiv.classList.toggle('hide');
    chatDiv.classList.toggle('hide');
    txtUser.value = '';
    txtChat.value = '';

    socket.disconnect();
}

btnSend.onclick = e => {
    const msg = txtChat.value;
    txtChat.value = '';

    socket.emit('chatMessage', JSON.stringify({
        user: txtUser.value, msg
    }))
}