const express = require('express');
const {Serial} = require("../serial");
const router = express.Router();
const serial = new Serial();

const TAP_DURATION = process.env.TAP_DURATION || 50;

const validKeys = [
    'CTRL',
    'ALT',
    'SHIFT',
    'META',
    'ESC',
    'TAB',
    'SPACE',
    'PIPE',
    'HOME',
    'END',
    'UP',
    'DOWN',
    'LEFT',
    'RIGHT',
    'RETURN',
    'BACKSPACE',
    'DELETE',
];

router.use(express.json());

router.post('/text', async (req, res) => {
    const text = req.body.text;
    if (text.length === 0) {
        res.status(400).send('Text is empty');
        return;
    }
    serial.write('T' + text);
    res.status(200).send('OK');
});

router.post('/press_key', async (req, res) => {
    const key = req.body.key;
    if (!key || key.length === 0) {
        res.status(400).send('Key is empty');
        return;
    }
    if (!validKeys.includes(key)) {
        res.status(400).send('Invalid key');
        return;
    }

    serial.write('P' + key);
    res.status(200).send('OK');
});

router.post('/release_key', async (req, res) => {
    const key = req.body.key;
    if (!key || key.length === 0) {
        res.status(400).send('Key is empty');
        return;
    }
    if (!validKeys.includes(key)) {
        res.status(400).send('Invalid key');
        return;
    }

    serial.write('R' + key);
    res.status(200).send('OK');
});

router.post('/tap_key', async (req, res) => {
    const key = req.body.key;
    if (!key || key.length === 0) {
        res.status(400).send('Key is empty');
        return;
    }
    if (!validKeys.includes(key)) {
        res.status(400).send('Invalid key');
        return;
    }

    serial.write('P' + key);
    setTimeout(() => serial.write('R' + key), TAP_DURATION);
    res.status(200).send('OK');
})

module.exports = {router};