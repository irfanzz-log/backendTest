import pg from 'pg';

// Konfigurasi koneksi PostgreSQL
const client = new pg.Pool({
  user: 'irfanzzs',       // username database
  password: 'admin123',   // password database
  host: 'localhost',      // host database
  port: 5432,             // port PostgreSQL default
  database: 'localdb',    // nama database
});

export default client;
