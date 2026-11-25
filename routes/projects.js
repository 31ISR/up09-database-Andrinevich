const express = require('express');
const db = require('../db');

const router = express.Router();

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const cleanTitle = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

router.get('/', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY id').all();
  res.json(projects);
});

router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Некорректный id' });

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!project) return res.status(404).json({ error: 'Проект не найден' });

  res.json(project);
});

router.post('/', (req, res) => {
  const title = cleanTitle(req.body?.title);
  if (!title) return res.status(400).json({ error: 'Укажите название проекта' });

  const info = db.prepare('INSERT INTO projects (title) VALUES (?)').run(title);
  const created = db
    .prepare('SELECT * FROM projects WHERE id = ?')
    .get(info.lastInsertRowid);

  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Некорректный id' });

  const title = cleanTitle(req.body?.title);
  if (!title) return res.status(400).json({ error: 'Укажите название проекта' });

  const info = db.prepare('UPDATE projects SET title = ? WHERE id = ?').run(title, id);
  if (info.changes === 0) return res.status(404).json({ error: 'Проект не найден' });

  res.json(db.prepare('SELECT * FROM projects WHERE id = ?').get(id));
});

router.delete('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Некорректный id' });

  const info = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Проект не найден' });

  res.status(204).end();
});

module.exports = router;
