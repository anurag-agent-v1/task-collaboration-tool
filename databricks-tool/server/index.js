const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const winston = require('winston');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const db = require('./db');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`)
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'app.log') }),
    new winston.transports.Console({ level: 'debug' })
  ]
});

const app = express();
const PORT = process.env.PORT || 4000;

db.init();

app.use(cors());
app.use(bodyParser.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  db.saveUser(email, hashed, (err) => {
    if (err) {
      logger.error(`Failed to register ${email}: ${err.message}`);
      return res.status(500).json({ error: 'Unable to create user.' });
    }
    logger.info(`User registered: ${email}`);
    res.json({ status: 'registered' });
  });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  db.findUserByEmail(email, async (err, user) => {
    if (err || !user) {
      logger.warn(`Failed login attempt for ${email}`);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      logger.warn(`Failed login attempt for ${email}`);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    logger.info(`User logged in: ${email}`);
    res.json({ status: 'authenticated' });
  });
});

app.post('/api/compare', (req, res) => {
  const { script } = req.body;
  if (!script) return res.status(400).json({ error: 'script is required' });

  db.getRuntimes((err, rows) => {
    if (err) {
      logger.error(`Unable to load runtimes: ${err.message}`);
      return res.status(500).json({ error: 'Database error' });
    }

    const keywords = script.toLowerCase();
    const scored = rows.map((row) => {
      const runtimeKeywords = (row.keywords || '').toLowerCase().split(',');
      const matches = runtimeKeywords.filter((keyword) => keyword && keywords.includes(keyword));
      return {
        score: matches.length,
        runtime: row,
        matches
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0].runtime;

    const highlights = scored[0].matches.length
      ? scored[0].matches.map((keyword) => `Detected keyword: ${keyword}`)
      : ['No direct keyword match; returning general recommendation.'];

    logger.info(`Script compared. Best runtime: ${best.runtime_name}`);

    res.json({
      runtime_name: best.runtime_name,
      version: best.version,
      spark_version: best.spark_version,
      language: best.language,
      notes: best.notes,
      highlights
    });
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  logger.info(`Databricks tooling backend listening on port ${PORT}`);
});
