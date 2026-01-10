const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data store
let db = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  ],
  posts: [
    { id: 1, title: 'First Post', content: 'Hello World!', authorId: 1 },
    { id: 2, title: 'Second Post', content: 'Mock backend is ready', authorId: 2 },
  ],
  todos: [
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build awesome app', completed: true },
  ],
  products: [
    { id: 1, name: 'Product A', price: 29.99, category: 'electronics' },
    { id: 2, name: 'Product B', price: 49.99, category: 'books' },
  ],
};

let nextIds = { users: 3, posts: 3, todos: 3, products: 3 };

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Simulate delay (default 2s, override with ?delay=ms or ?delay=0 for instant)
app.use((req, res, next) => {
  const delay = req.query.delay !== undefined ? parseInt(req.query.delay) : 2000;
  setTimeout(next, delay);
});

// Generic CRUD helpers
const getAll = (resource) => (req, res) => res.json(db[resource]);
const getById = (resource) => (req, res) => {
  const item = db[resource].find(x => x.id === parseInt(req.params.id));
  item ? res.json(item) : res.status(404).json({ error: 'Not found' });
};
const create = (resource) => (req, res) => {
  const item = { id: nextIds[resource]++, ...req.body };
  db[resource].push(item);
  res.status(201).json(item);
};
const update = (resource) => (req, res) => {
  const idx = db[resource].findIndex(x => x.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db[resource][idx] = { ...db[resource][idx], ...req.body };
  res.json(db[resource][idx]);
};
const remove = (resource) => (req, res) => {
  const idx = db[resource].findIndex(x => x.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db[resource].splice(idx, 1);
  res.status(204).send();
};

// Resources - apply CRUD to each
['users', 'posts', 'todos', 'products'].forEach(resource => {
  app.get(`/api/${resource}`, getAll(resource));
  app.get(`/api/${resource}/:id`, getById(resource));
  app.post(`/api/${resource}`, create(resource));
  app.put(`/api/${resource}/:id`, update(resource));
  app.delete(`/api/${resource}/:id`, remove(resource));
});

// Auth endpoints (mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (user) {
    res.json({ token: 'mock-jwt-token', user });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => res.json({ message: 'Logged out' }));

app.get('/api/auth/me', (req, res) => {
  res.json(db.users[0]);
});

// Search endpoint
app.get('/api/search/:resource', (req, res) => {
  const { resource } = req.params;
  const { q } = req.query;
  if (!db[resource]) return res.status(404).json({ error: 'Resource not found' });
  const results = db[resource].filter(item =>
    Object.values(item).some(v => String(v).toLowerCase().includes(q?.toLowerCase() || ''))
  );
  res.json(results);
});

// Reset data
app.post('/api/reset', (req, res) => {
  db.users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  ];
  db.posts = [
    { id: 1, title: 'First Post', content: 'Hello World!', authorId: 1 },
    { id: 2, title: 'Second Post', content: 'Mock backend is ready', authorId: 2 },
  ];
  db.todos = [
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build awesome app', completed: true },
  ];
  db.products = [
    { id: 1, name: 'Product A', price: 29.99, category: 'electronics' },
    { id: 2, name: 'Product B', price: 49.99, category: 'books' },
  ];
  nextIds = { users: 3, posts: 3, todos: 3, products: 3 };
  res.json({ message: 'Data reset to initial state' });
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    /api/users`);
  console.log(`  GET    /api/users/:id`);
  console.log(`  POST   /api/users`);
  console.log(`  PUT    /api/users/:id`);
  console.log(`  DELETE /api/users/:id`);
  console.log(`  (Same pattern for: posts, todos, products)`);
  console.log(`\nAuth endpoints:`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  POST   /api/auth/logout`);
  console.log(`  GET    /api/auth/me`);
  console.log(`\nUtilities:`);
  console.log(`  GET    /health`);
  console.log(`  GET    /api/search/:resource?q=query`);
  console.log(`  POST   /api/reset`);
  console.log(`\nAdd ?delay=1000 to any request to simulate network delay`);
});
