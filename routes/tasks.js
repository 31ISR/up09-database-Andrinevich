const express = require('express');
const db = require('../db');

const router = express.Router();

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const cleanTitle = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

// true/false/1/0/"1"/"0" -> 1 | 0, иначе null
const parseDone = (value) => {
  if (value === true || value === 1 || value === '1' || value === 'true') return 1;
  if (value === false || value === 0 || value === '0' || value === 'false') return 0;
  return null;
};

const findTask = (id) => db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

router.get('/', (req, res) => {
  const conditions = [];
  const params = [];

  if (req.query.project_id !== undefined) {
    const projectId = parseId(req.query.project_id);
    if (!projectId) return res.status(400).json({ error: 'Некорректный project_id' });
    conditions.push('project_id = ?');
    params.push(projectId);
  }

  if (req.query.done !== undefined) {
    const done = parseDone(req.query.done);
    if (done === null) return res.status(400).json({ error: 'Некорректное значение done' });
    conditions.push('done = ?');
    params.push(done);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const tasks = db.prepare(`SELECT * FROM tasks ${where} ORDER BY id`).all(...params);

  res.json(tasks);
});

router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Некорректный id' });

  const task = findTask(id);
  if (!task) return res.status(404).json({ error: 'Задача не найдена' });

  res.json(task);
});

router.post('/', (req, res) => {
  const projectId = parseId(req.body?.project_id);
  const title = cleanTitle(req.body?.title);

  if (!projectId) return res.status(400).json({ error: 'Укажите корректный project_id' });
  if (!title) return res.status(400).json({ error: 'Укажите название задачи' });

  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
  if (!project) return res.status(404).json({ error: 'Проект не найден' });

  const done = req.body.done === undefined ? 0 : parseDone(req.body.done);
  if (done === null) return res.status(400).json({ error: 'Некорректное значение done' });

  const info = db
    .prepare('INSERT INTO tasks (project_id, title, done) VALUES (?, ?, ?)')
    .run(projectId, title, done);

  res.status(201).json(findTask(info.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Некорректный id' });

  const current = findTask(id);
  if (!current) return res.status(404).json({ error: 'Задача не найдена' });

  let title = current.title;
  let done = current.done;

  if (req.body?.title !== undefined) {
    title = cleanTitle(req.body.title);
    if (!title) return res.status(400).json({ error: 'Название не может быть пустым' });
  }

  if (req.body?.done !== undefined) {
    done = parseDone(req.body.done);
    if (done === null) return res.status(400).json({ error: 'Некорректное значение done' });
  }

  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(title, done, id);

  res.json(findTask(id));
});

router.delete('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Некорректный id' });

  const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Задача не найдена' });

  res.status(204).end();
});

module.exports = router;
