const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const path = require('path');
const spotify = require('./spotify');
const util = require('./util');

const app = express();
const server = new http.createServer(app);
const io = new socketIO.Server(server);

const spotifyRooms = new Map();

app.use(express.static(path.resolve('client/')));

app.get('/', (req, res) => {
    res.redirect('/login');
})

app.get('/login', (req, res) => {
    res.sendFile(path.resolve('client/html/login.html'));
})

app.get('/auth/login', (req, res) => {
    const scopes = ['user-read-playback-state'];
    const state = util.randomString(16);
    res.redirect(spotify.api.createAuthorizeURL(scopes, state));
})

app.get('/auth/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) return res.redirect('/login?error=' + error);

    const response = await spotify.api.authorizationCodeGrant(code);

    const room = new spotify.Room(response.body.access_token, io);
    spotifyRooms.set(room.id, room);

    res.redirect('/' + room.id);
})

app.get('/:id', (req, res) => {
    res.sendFile(path.resolve('client/html/room.html'));
})

server.listen(3000, () => {
    console.log('Sever started.');
})

io.on('connect', async socket => {
    const room = spotifyRooms.get(socket.request._query.room);

    if (!room) return socket.emit('redirect', '/login');

    socket.join(room.id);
    console.log(`User ${socket.id} joined room ${room.id}.`);

    // Inital state
    socket.emit('state', room.state);

    socket.on('volume', volume => room.setVolume(volume));
    socket.on('playNext', uri => room.playNext(uri));
})