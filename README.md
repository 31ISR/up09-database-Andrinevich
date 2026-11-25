# up09-database

REST API для управления проектами и задачами (Express + SQLite).

## Требования

- [Git](https://git-scm.com/)
- [NodeJS](https://nodejs.org/en/download)
- [VSCode](https://code.visualstudio.com/)

## Запуск

```bash
npm install
npm start        # или npm run dev для автоперезапуска
```

Сервер стартует на порту 3000 (или `PORT` из окружения).

## Эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| GET | /api | проверка работоспособности |
| GET | /api/projects | список проектов |
| GET | /api/projects/:id | один проект |
| POST | /api/projects | создать (`{ "title": "..." }`) |
| PUT | /api/projects/:id | изменить название |
| DELETE | /api/projects/:id | удалить вместе с задачами |
| GET | /api/tasks | список задач (`?project_id=1&done=0`) |
| GET | /api/tasks/:id | одна задача |
| POST | /api/tasks | создать (`{ "project_id": 1, "title": "..." }`) |
| PUT | /api/tasks/:id | изменить (`title`, `done`) |
| DELETE | /api/tasks/:id | удалить |
