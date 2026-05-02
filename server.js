const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');

const readJson = async (filename) => {
  const filePath = path.join(dataDir, filename);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
};

const writeJson = async (filename, data) => {
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const normalizeRoll = (roll) => String(roll || '').trim();

const sendJson = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
};

const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

const getPathSegments = (pathname) => pathname.replace(/^\/|\/$/g, '').split('/');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const segments = getPathSegments(pathname);

  if (method === 'OPTIONS') {
    return sendJson(res, 204, { success: true });
  }

  try {
    if (pathname === '/api/ping' && method === 'GET') {
      return sendJson(res, 200, { status: 'ok', time: new Date().toISOString() });
    }

    if (pathname === '/api/login' && method === 'POST') {
      const body = await parseBody(req);
      const roll = normalizeRoll(body.roll);
      if (!roll) {
        return sendJson(res, 400, { error: 'Roll number is required.' });
      }
      const users = await readJson('users.json');
      const user = users.find((item) => item.roll === roll);
      if (!user) {
        return sendJson(res, 401, { error: 'Invalid roll number.' });
      }
      return sendJson(res, 200, { success: true, user });
    }

    if (segments[0] === 'api' && segments[1] === 'profile' && method === 'GET' && segments[2]) {
      const roll = normalizeRoll(segments[2]);
      const users = await readJson('users.json');
      const user = users.find((item) => item.roll === roll);
      if (!user) {
        return sendJson(res, 404, { error: 'Profile not found.' });
      }
      return sendJson(res, 200, { user });
    }

    if (segments[0] === 'api' && segments[1] === 'messages' && method === 'GET' && segments[2]) {
      const roll = normalizeRoll(segments[2]);
      const messages = await readJson('messages.json');
      const userMessages = messages.filter((msg) => msg.to === roll || msg.from === roll);
      return sendJson(res, 200, { messages: userMessages });
    }

    if (pathname === '/api/messages' && method === 'POST') {
      const body = await parseBody(req);
      const { from, to, text } = body;
      if (!from || !to || !text) {
        return sendJson(res, 400, { error: 'from, to, and text are required.' });
      }
      const messages = await readJson('messages.json');
      const nextId = String(messages.length + 1);
      const newMessage = { id: nextId, from, to, text, createdAt: new Date().toISOString() };
      messages.push(newMessage);
      await writeJson('messages.json', messages);
      return sendJson(res, 201, { message: newMessage });
    }

    if (pathname === '/api/resources' && method === 'GET') {
      const resources = await readJson('resources.json');
      const query = String(parsedUrl.query.q || '').trim().toLowerCase();
      const category = String(parsedUrl.query.category || '').trim().toLowerCase();
      let filtered = resources;
      if (query) {
        filtered = filtered.filter((item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }
      if (category) {
        filtered = filtered.filter((item) => item.category.toLowerCase() === category);
      }
      return sendJson(res, 200, { resources: filtered });
    }

    if (pathname === '/api/resources' && method === 'POST') {
      const body = await parseBody(req);
      const { title, description, category, ownerRoll, price } = body;
      if (!title || !category || !ownerRoll) {
        return sendJson(res, 400, { error: 'title, category, and ownerRoll are required.' });
      }
      const resources = await readJson('resources.json');
      const nextId = String(resources.length + 1);
      const newResource = {
        id: nextId,
        title,
        description: description || '',
        category,
        ownerRoll,
        price: price || 'Free',
        createdAt: new Date().toISOString()
      };
      resources.push(newResource);
      await writeJson('resources.json', resources);
      return sendJson(res, 201, { resource: newResource });
    }

    if (pathname === '/api/search' && method === 'GET') {
      const q = String(parsedUrl.query.q || '').trim().toLowerCase();
      if (!q) {
        return sendJson(res, 400, { error: 'Search query is required.' });
      }
      const resources = await readJson('resources.json');
      const users = await readJson('users.json');
      const resourceMatches = resources.filter((item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
      const userMatches = users.filter((item) =>
        item.name.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q)
      );
      return sendJson(res, 200, { results: { resources: resourceMatches, users: userMatches } });
    }

    return sendJson(res, 404, { error: 'API route not found' });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`EduSwap backend running on http://localhost:${PORT}`);
});
