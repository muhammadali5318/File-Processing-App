const express = require('express');
const path = require('path');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const { processFile, fileEvents } = require('./processor');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Monitor directory for changes
const watcher = chokidar.watch(path.join(__dirname, 'watched-directory'), {
    persistent: true
});

watcher.on('add', async (filePath) => {
    console.log(`File added: ${filePath}`);
    broadcast(`File added: ${filePath}`);
    await processFile(filePath);
    broadcast(`File processed: ${filePath}`);
});

watcher.on('change', (filePath) => {
    console.log(`File changed: ${filePath}`);
    broadcast(`File changed: ${filePath}`);
});

watcher.on('unlink', (filePath) => {
    console.log(`File removed: ${filePath}`);
    broadcast(`File removed: ${filePath}`);
});

fileEvents.on('processingStart', (filePath) => {
    broadcast(`Processing started: ${filePath}`);
});

fileEvents.on('processingComplete', (filePath) => {
    broadcast(`Processing complete: ${filePath}`);
});

fileEvents.on('processingError', (filePath, error) => {
    broadcast(`Processing error: ${filePath} - ${error.message}`);
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}
