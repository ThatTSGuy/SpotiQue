const express = require('express');
const session = require('express-session');
const path = require('node:path');
const spotify = require('./spotify');

const redirectURI = 'http://localhost:3000/auth/callback';

const app = express();

app.use(express.static(path.resolve('client/')));
app.use(session({
    secret: '8834f958-171c-40cc-87a0-369a32f50e0c',
    
}))

app.get('/', (req, res) => {
    res.redirect('/login');
})

app.get('/login', (req, res) => {
    res.sendFile(path.resolve('client/html/login.html'));
})

app.get('/account')

app.get('/auth/login', (req, res) => {
    res.redirect(spotify.getAuthURL());
})

app.get('/auth/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) return res.redirect('/login?error=' + error);

    const token = await spotify.getAuthToken(code);

    console.log(token);
})

app.listen(3000, () => {
    console.log('Sever started.');
})