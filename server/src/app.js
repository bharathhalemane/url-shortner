const express = require('express');
const urlRoutes = require('./routes/urlRoutes');

const app = express();
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use(urlRoutes);

app.use((err, req, res, next) => {
    if(err.status) return res.status(err.status).json({error: err.message})
        console.log(err)
    res.status(500).json({error: "Internal server error"})
})

module.exports = app;