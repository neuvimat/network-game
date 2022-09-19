const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {websocketUrl: process.env.WS || 'ws://localhost:3000'});
});
router.get('/editor', function (req, res, next) {
    res.render('editor');
});
router.get('/testing', function (req, res, next) {
    // random route for testing
    // or use TESTING.html in project folder for local testing
    res.render('testing');
});

module.exports = router;
