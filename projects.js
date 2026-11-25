const express = require('express');
const db = require('../db');

const router = expreess.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Successful request'});
});

module.exports = router;