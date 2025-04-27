import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3333;

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);
  
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile('trialsage.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading TrialSage HTML');
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    });
  } else if (req.url === '/api/login' && req.method === 'POST') {
    // Handle login API
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.username === 'admin' && data.password === 'admin123') {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({success: true, user: {name: 'Administrator'}}));
        } else {
          res.writeHead(401, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({success: false, message: 'Invalid credentials'}));
        }
      } catch (e) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: false, message: 'Invalid request'}));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running at http://0.0.0.0:${PORT}/`);
});
