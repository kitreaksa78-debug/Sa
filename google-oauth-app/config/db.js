const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

const DATA_DIR = path.join(__dirname, '..', 'data')
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const db = new Database(path.join(DATA_DIR, 'app.db'))

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT NOT NULL UNIQUE,
    name TEXT,
    email TEXT,
    avatar TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

function findUserByGoogleId(googleId) {
  return db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId)
}

function createUser(profile) {
  const { id, displayName, emails, photos } = profile
  const info = db
    .prepare(
      'INSERT INTO users (google_id, name, email, avatar) VALUES (?, ?, ?, ?)',
    )
    .run(
      id,
      displayName || '',
      emails && emails[0] ? emails[0].value : '',
      photos && photos[0] ? photos[0].value : '',
    )
  return db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
}

function updateUser(profile) {
  const { id, displayName, emails, photos } = profile
  db.prepare(
    'UPDATE users SET name = ?, email = ?, avatar = ? WHERE google_id = ?',
  ).run(
    displayName || '',
    emails && emails[0] ? emails[0].value : '',
    photos && photos[0] ? photos[0].value : '',
    id,
  )
  return findUserByGoogleId(id)
}

module.exports = { db, findUserByGoogleId, createUser, updateUser }
