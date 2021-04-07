const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(usr => usr.username === username);

  if (!user) return response.status(400).json({ error: 'User not found' });

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if (userAlreadyExists)
    return response.status(400).json({ error: 'User already exists' });

  const user = {
    id: uuid(),
    name,
    username,
    todos: []
  };

  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { todos } = request.user;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const index = todos.findIndex(item => item.id === id);

  if (index < 0) return response.status(404).json({ error: 'Todo not found' });

  todos[index].title = title;
  todos[index].deadline = new Date(deadline);

  return response.status(201).json(todos[index]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { id } = request.params;

  const index = todos.findIndex(item => item.id === id);

  if (index < 0) return response.status(404).json({ error: 'Todo not found' });

  todos[index].done = true;

  return response.status(201).json(todos[index]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { id } = request.params;

  const index = todos.findIndex(item => item.id === id);

  if (index < 0) return response.status(404).json({ error: 'Todo not found' });

  todos.splice(index, 1);

  return response.status(204).send();
});

module.exports = app;
