import express from 'express';
import client from '../pg.js';

const router = express.Router();

// Fungsi build tree dari flat menu
function buildTree(rows, parentId = null) {
  return rows
    .filter(r => r.parent_id === parentId)
    .map(r => ({
      id: r.id,
      name: r.title,
      children: buildTree(rows, r.id)
    }));
}

// Ambil menu sesuai role
async function getMenuByRole(roleName) {
  roleName = roleName.toLowerCase();

  // SUPERADMIN  ambil semua menu tanpa filter
  if (roleName === 'superadmin') {
    const result = await client.query(`
      SELECT id, title, parent_id
      FROM menu
      ORDER BY id;
    `);
    return buildTree(result.rows);
  }

  // ADMIN ambil menu sesuai can_view (JOIN menu_access)
  if (roleName === 'admin') {
    const result = await client.query(`
      WITH RECURSIVE menu_hierarchy AS (
          SELECT m.id, m.title, m.parent_id
          FROM menu m
          JOIN menu_access ma ON ma.menu_id = m.id
          JOIN role r ON r.id = ma.role_id
          WHERE ma.can_view = true
            AND LOWER(r.name) = $1
            AND m.parent_id IS NULL

          UNION ALL

          SELECT m.id, m.title, m.parent_id
          FROM menu m
          INNER JOIN menu_hierarchy mh ON m.parent_id = mh.id
          JOIN menu_access ma ON ma.menu_id = m.id
          JOIN role r ON r.id = ma.role_id
          WHERE ma.can_view = true
            AND LOWER(r.name) = $1
      )
      SELECT * FROM menu_hierarchy
      ORDER BY parent_id, id;
    `, [roleName]);
    return buildTree(result.rows);
  }

  // USER hanya ambil parent/root menu sesuai can_view
  if (roleName === 'user') {
    const result = await client.query(`
      SELECT m.id, m.title, m.parent_id
      FROM menu m
      JOIN menu_access ma ON ma.menu_id = m.id
      JOIN role r ON r.id = ma.role_id
      WHERE ma.can_view = true
        AND LOWER(r.name) = $1
        AND m.parent_id IS NULL
      ORDER BY id;
    `, [roleName]);
    return buildTree(result.rows);
  }

  // Default kosong
  return [];
}

// Route API
router.get('/', (req,res)=> {
    res.send('hello from user');
})

router.get('/menu', async (req, res) => {
  const roleName = req.activeRole || 'user'; // ambil role dari cookie
  const menu = await getMenuByRole(roleName);
  res.json(menu);
});

export default router;
