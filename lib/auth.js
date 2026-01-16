const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('./db');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function hash(password){
  return bcrypt.hashSync(password, 10);
}
function compare(password, hashpw){
  return bcrypt.compareSync(password, hashpw);
}
function sign(payload){
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}
function verify(token){
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch(e){ return null; }
}

async function register({name,email,password,role='driver'}){
  const id = uuidv4();
  const pw = hash(password);
  const created_at = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO users (id,name,email,password,role,created_at) VALUES (?,?,?,?,?,?)');
  stmt.run(id,name,email,pw,role,created_at);
  return { id, name, email, role, created_at };
}

function findUserByEmail(email){
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

module.exports = { hash, compare, sign, verify, register, findUserByEmail };
