const express = require('express')
const router = express.Router()

router.post('/passwordlogin', (req, res) => {
    try {
        const { email, password } = req.query;

        return res.json({ message: 'Password login endpoint', email, password });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})


module.exports = router;