const express = require('express');
const router = express.Router();


router.post('/verify', (req, res) => {
    try {
        console.log(req.body);
        res.send('Payment route is under construction.');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.post('/status', (req, res) => {
    try {
        
    res.send('Payment route is under construction.');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.post('/restore', (req, res) => {
    try {
        
    res.send('Payment route is under construction.');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})
module.exports = router;