require('dotenv').config();
const express = require('express');
const session = require('express-session');
const WebSocket = require('ws');
const {spawn} = require('child_process');

const debug = process.env.DEBUG === 'true';
const app = express();
const wss = new WebSocket.WebSocketServer({noServer: true});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.use(express.static('static'));

const {router: apiRouter} = require('./routes/api.js');
app.use('/api', requireAuth, apiRouter);

const {router: loginRouter} = require('./routes/login.js');
app.use('/login', loginRouter);

app.use('/manage', requireAuth, express.static('static/manage.html'));

const server = app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

wss.on('connection', ws => {
    console.log(`WebSocket connection from ${ws._socket.remoteAddress}`);

    const ffmpeg = spawn('ffmpeg', [
        '-f', 'v4l2', // Input format
        '-i', process.env.DEVICE, // Input device
        '-an', // No audio
        '-f', 'h264', // Format
        '-c:v', 'libx264', // Video codec
        '-preset', 'ultrafast', // Encoding speed
        '-tune', 'zerolatency', // Zero latency
        '-s', '1280x720', // Frame size
        '-r', '30', // Frame rate
        '-b:v', '500k', // Bitrate
        '-bf', '0', // No B frames
        '-movflags', 'frag_keyframe+empty_moov', // Gragmented MP4
        'pipe:1' // Output to stdout
    ]);

    ffmpeg.stdout.on('data', data => {
        ws.send(data);
    });

    ffmpeg.stderr.on('data', data => {
        if (debug) console.error(`ffmpeg stderr: ${data}`);
    });

    ffmpeg.on('close', code => {
        if (debug) console.log(`ffmpeg exited with code ${code}`);
    });

    ffmpeg.on('error', err => {
        if (debug) console.error('ffmpeg error: ', err);
    });

    ws.on('close', () => {
        ffmpeg.kill('SIGINT');
    });
});

function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}