import express from 'express';
import jwt from 'jsonwebtoken';
import client from '../pg.js';

const router = express.Router();

// Cek apakah user sudah login (JWT valid)
function checkLoggedIn(req) {
    const token = req.cookies?.token;
    if (!token) return false;

    try {
        jwt.verify(token, 'secrets');
        return true;
    } catch {
        return false;
    }
}

// Route root (publik)
router.get('/', (req, res) => {
    res.send('hello from root');
});

// Halaman login
router.get('/login', (req, res) => {
    if (checkLoggedIn(req)) return res.redirect('/user'); // redirect jika sudah login
    return res.render('login');
});

// Proses login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Ambil user berdasarkan username
        const users = await client.query(
            'SELECT * FROM "user" WHERE username = $1', 
            [username]
        );
        const user = users.rows[0];
        if (!user) return res.send('username tidak terdaftar');

        // Ambil semua role user
        const roleResult = await client.query(
            `SELECT role.name AS role_name 
             FROM user_role 
             JOIN role ON user_role.id_role = role.id 
             WHERE user_role.id_user = (SELECT id FROM "user" WHERE username = $1)`,
            [username]
        );
        const roleUser = roleResult.rows;

        // Validasi password
        if (password === user.password) {
            // Buat JWT
            const sign = jwt.sign({
                user: user.id,
                role: roleUser.map(r => r.role_name) // array role
            }, 'secrets', { expiresIn: '1h' });

            // Set cookie
            res.cookie('token', sign, {
                httpOnly: true,
                secure: false, // development
                maxAge: 3600000 // 1 jam
            });

            return res.redirect('/user');
        }

        return res.send('password salah');
    } catch (err) {
        res.status(400).send('query error');
    }
});

export default router;
