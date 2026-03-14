const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'app.db');
const db = new sqlite3.Database(dbPath);

const init = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password_hash TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS runtimes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        runtime_name TEXT,
        version TEXT,
        spark_version TEXT,
        language TEXT,
        notes TEXT,
        keywords TEXT,
        highlights TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS comparisons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        script_excerpt TEXT,
        runtime_id INTEGER,
        runtime_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      INSERT OR IGNORE INTO runtimes (runtime_name, version, spark_version, language, notes, keywords, highlights)
      VALUES
        ('Spark 3.4 LTS', '2025-10-05', '3.4.0', 'Python', 'Stable, LTS with Delta Live Tables support', 'python,delta,dl', 'LTS release|Delta Lake optimizations|Recommended for production'),
        ('Photon 4.0', '2026-01-11', '3.5.1', 'SQL', 'Photon engine tuned for SQL/query workloads', 'sql,photon,sky', 'Photon acceleration|Advanced caching|Serverless ready'),
        ('ML Runtime 13', '2026-02-20', '3.5.0', 'Python', 'Includes MLflow 3.0 and GPU drivers', 'ml,mlflow,gpu', 'MLflow pipelines|GPU driver support|Preinstalled libraries')
    `);
  });
};

const getRuntimes = (callback) => {
  db.all('SELECT * FROM runtimes', callback);
};

const getComparisons = (callback) => {
  db.all(
    `SELECT c.id, c.script_excerpt, c.runtime_name, c.created_at, r.spark_version, r.language
     FROM comparisons c
     LEFT JOIN runtimes r ON c.runtime_id = r.id
     ORDER BY c.created_at DESC
     LIMIT 6`,
    callback
  );
};

const saveComparison = (scriptExcerpt, runtimeId, runtimeName, callback) => {
  db.run(
    'INSERT INTO comparisons (script_excerpt, runtime_id, runtime_name) VALUES (?, ?, ?)',
    [scriptExcerpt, runtimeId, runtimeName],
    function (err) {
      callback(err, this.lastID);
    }
  );
};

const saveUser = (email, passwordHash, callback) => {
  db.run(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, passwordHash],
    function (err) {
      callback(err, this.lastID);
    }
  );
};

const findUserByEmail = (email, callback) => {
  db.get('SELECT * FROM users WHERE email = ?', [email], callback);
};

module.exports = {
  init,
  getRuntimes,
  getComparisons,
  saveComparison,
  saveUser,
  findUserByEmail,
  dbPath,
};
