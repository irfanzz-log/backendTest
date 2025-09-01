import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import root from './route/root.js';
import user from './route/user.js';
import role from './route/role.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware & setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: cek login via JWT
function verifyLogin(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.redirect('/login');

  try {
    const payload = jwt.verify(token, 'secrets');
    req.user = { id: payload.user, role: payload.role }; // array role
    req.activeRole = req.cookies?.activeRole; // role aktif jika ada
  } catch {
    return res.redirect('/login');
  }

  next();
}

// Middleware: cek activeRole untuk user dengan banyak role
export function verifyActiveRole(req, res, next) {
  const roleCount = req.user?.role?.length || 0;

  if (roleCount < 2) return next(); // user cuma punya 1 role → langsung lanjut
  if (!req.activeRole) return res.redirect('/user/role'); // wajib pilih activeRole

  next();
}

// Routes
app.use('/', root);
app.use('/user/role', verifyLogin, role);
app.use('/user', verifyLogin, verifyActiveRole, user);

export default app;
