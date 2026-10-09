const express = require('express');
const urlRoutes = require('./routes/urlRoutes');
const helmet = require('helmet')
const cors = require('cors')

const app = express();
const { trustProxy } = require('./config/env');
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(helmet({crossOriginResourcePolicy: {policy: 'cross-origin'}}));
app.set('trust proxy', trustProxy);
app.use(cors({origin: allowedOrigins.length ? allowedOrigins : false,
  methods: ['GET', 'POST']}))
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/debug-ip', (req, res) => res.json({ip: req.ip, ips: req.ips, xff: req.get('x-forwarded-for')}))
app.use(urlRoutes);

app.use((err, req, res, next) => {
    if(err.status) return res.status(err.status).json({error: err.message})
        console.log(err)
    res.status(500).json({error: "Internal server error"})
})

module.exports = app;