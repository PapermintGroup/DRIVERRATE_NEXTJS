const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), 'driverrate.sqlite');

function init() {
  const exists = fs.existsSync(DB_PATH);
  const db = new Database(DB_PATH);
  if (!exists) {
    db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        created_at TEXT
      );
      CREATE TABLE drivers (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT,
        company TEXT,
        profile_photo TEXT,
        service_areas TEXT,
        routes TEXT,
        created_at TEXT
      );
      CREATE TABLE reviews (
        id TEXT PRIMARY KEY,
        driver_id TEXT,
        punctuality INTEGER,
        cleanliness INTEGER,
        trustworthiness INTEGER,
        safety INTEGER,
        communication INTEGER,
        reliability INTEGER,
        comment TEXT,
        created_at TEXT
      );
    `);
    console.log('Created new DB at', DB_PATH);
  }
  return db;
}

const db = init();

module.exports = { db };
