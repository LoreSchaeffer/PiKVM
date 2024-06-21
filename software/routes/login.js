require('dotenv').config();
const express = require('express');
const router = express.Router();

router.use(express.urlencoded({extended: true}));
router.post('/', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const keepLogin = req.body.keepLogin ? req.body.keepLogin === 'on' : false;

    const correctUsername = process.env.USERNAME;
    const correctPassword = process.env.PASSWORD;

    if (username !== correctUsername || password !== correctPassword) {
        res.redirect('/?error=1');
        return;
    }

    req.session.user = username;

    if (keepLogin) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;

    res.redirect('/manage');
});

module.exports = {router};