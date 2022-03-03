const express = require('express');
const fetch = require('node-fetch');
const crypto = require('node:crypto');
const path = require('node:path');

const clientID = '6b013b2d7ae74dd59705df7deafb590e';
const clientSecret = 'a7082d1445ea4f40ad0a02591de24628';
const codeVerifier = crypto.randomBytes(32).toString('hex');
const redirectURI = 'http://localhost:3000/callback';

const app = express();

app.use(express.static('../client/views'));

app.get('/', (req, res) => {
    res.sendFile(path.resolve('client/login/index.html'));
})

app.get('/login', (req, res) => {
    const state = crypto.randomUUID();
    const scope = 'user-read-private';

    res.redirect('https://accounts.spotify.com/authorize?' +
        toQueryString({
            response_type: 'code',
            client_id: clientID,
            scope: scope,
            redirect_uri: redirectURI,
            state: state,
            // PKCE extension
            code_challenge_method: 'S256',
            code_challenge: crypto.createHash('sha256').update(codeVerifier).digest('base64url'),
        })
    )
})

app.get('/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        res.send('An error occurred while trying to authenticate you: ' + error);
        return;
    }

    let response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: toQueryString({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectURI,
            // PKCE extension
            client_id: clientID,
            code_verifier: codeVerifier,
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${clientID}:${clientSecret}`).toString('base64'),
        },
    })

    let data = await response.json();

    console.log(data);

    response = await fetch('https://api.spotify.com/v1/me/player/queue', {
        method: 'POST',
        body: toQueryString({
            uri: 'spotify:track:2GYHyAoLWpkxLVa4oYTVko',
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + data.access_token,
        },
    })

    console.log(await response.json());
})

app.listen(3000, () => {
    console.log('Sever started.');
})

function toQueryString(object) {
    return Object.keys(object)
        .map(key => `${key}=${object[key]}`)
        .join('&');
}