import express from 'express';

const router = express.Router();

// Halaman pilih role
router.get('/', (req, res) => {
    const role = req.user.role; // array semua role user
    console.log('Active role cookie:', req.activeRole);

    res.render('role', { role });
});

// Set role aktif (dari form)
router.post('/set-role', (req, res) => {
    const role = req.body.role;

    // Simpan role aktif di cookie
    res.cookie('activeRole', role, {
        httpOnly: true,
        secure: false,   // development
        maxAge: 3600000  // 1 jam
    });

    return res.redirect('/user');
});

export default router;
