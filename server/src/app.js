const express = require('express');
const urlRoutes = require('./routes/urlRoutes');

const app = express();
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use(urlRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({error: "Internal server error"})
})

module.exports = app;