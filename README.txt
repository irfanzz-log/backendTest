README – API Endpoints

    1. Login


Endpoint: POST /login

Request Body: { “username”: “string”, “password”: “string” }

Response: - Success: Redirect ke /user, cookie token disimpan (JWT, httpOnly, maxAge 1 jam) - Failure: username tidak terdaftar, password salah, query error (status 400)

JWT payload: { “user”: , “role”: [“user”, “admin”, …] }

    2. Root Page


Endpoint: GET / Response: Plain text “hello from root”

    3. User Dashboard


Endpoint: GET /user Middleware: verifyLogin, verifyActiveRole Response: Render halaman user.ejs, req.user.role = array semua role, req.activeRole = role aktif (cookie)

    4. Role Selection


Endpoint GET /user/role Middleware: verifyLogin Response: Render role.ejs, role = array semua role, req.activeRole = cookie

Endpoint POST /user/role/set-role Request Body: { “role”: “user” } Response: Simpan cookie activeRole, redirect ke /user

    5. Menu API


Endpoint: GET /menu Middleware: verifyLogin, optional verifyActiveRole Request: Cookie token dan activeRole Response: JSON tree menu sesuai can_view dan role

    6. Cookies


token: JWT, httpOnly, maxAge 1 jam, berisi user id dan array role activeRole: Role aktif user, httpOnly, maxAge 1 jam

    7. Notes untuk Frontend


    • Login: kirim username & password, simpan cookie token


    • Role Selection: tampilkan jika user punya >1 role


    • Menu: ambil /menu untuk render navigasi


    • Semua route /user/* memerlukan cookie token


    • Active Role digunakan untuk filter menu jika user punya banyak role

