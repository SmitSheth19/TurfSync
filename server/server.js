require('dotenv').config();
const http = require('http');
const { WebSocketServer } = require('ws');
const app = require('./app');

const bookingController = require('./controllers/bookingController');
const adminController   = require('./controllers/adminController');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// WebSocket server — local dev only (replaced by Supabase Realtime in production)
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'TurfSync Real-Time Slot Channel Active' }));
  ws.on('close', () => clients.delete(ws));
  ws.on('error', () => clients.delete(ws));
});

function broadcast(event) {
  const payload = JSON.stringify(event);
  clients.forEach(c => { if (c.readyState === 1) c.send(payload); });
}

bookingController.setWsBroadcaster(broadcast);
adminController.setWsBroadcaster(broadcast);

server.listen(PORT, () => {
  console.log('TurfSync Express Server listening on http://localhost:' + PORT);
  console.log('Real-Time WebSockets broadcaster running on ws://localhost:' + PORT);
});
