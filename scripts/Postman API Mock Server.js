const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage
const tasks = new Map();
const uploads = new Map();
const chunks = new Map();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to simulate processing
function simulateProcessing(taskId) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 25;
    const task = tasks.get(taskId);
    
    if (!task || task.status === 'cancelled') {
      clearInterval(interval);
      return;
    }

    task.progress = progress;
    task.updated_at = new Date().toISOString();

    if (progress >= 100) {
      task.status = 'completed';
      task.fileReady = true;
      clearInterval(interval);
    } else {
      task.status = 'processing';
    }

    tasks.set(taskId, task);
  }, 2000);
}

// POST /api/upload - Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const taskId = uuidv4();
  const task = {
    task_id: taskId,
    status: 'queued',
    progress: 0,
    filename: req.file.originalname,
    size: req.file.size,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    fileData: req.file.buffer
  };

  tasks.set(taskId, task);
  
  // Start processing simulation
  setTimeout(() => simulateProcessing(taskId), 500);

  res.status(201).json({
    task_id: taskId,
    status: 'queued',
    message: 'File uploaded successfully'
  });
});

// GET /api/task/:id - Get task status
app.get('/api/task/:id', (req, res) => {
  const task = tasks.get(req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json({
    task_id: task.task_id,
    status: task.status,
    progress: task.progress,
    created_at: task.created_at,
    updated_at: task.updated_at,
    error: task.error || null
  });
});

// GET /api/events/:id - SSE stream
app.get('/api/events/:id', (req, res) => {
  const task = tasks.get(req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = () => {
    const currentTask = tasks.get(req.params.id);
    
    if (!currentTask) {
      res.write(`data: ${JSON.stringify({ type: 'close', message: 'Task not found' })}\n\n`);
      res.end();
      return;
    }

    const eventData = {
      progress: currentTask.progress,
      status: currentTask.status,
      message: `Processing: ${currentTask.progress}%`
    };

    res.write(`data: ${JSON.stringify(eventData)}\n\n`);

    if (currentTask.status === 'completed' || currentTask.status === 'failed' || currentTask.status === 'cancelled') {
      res.write(`data: ${JSON.stringify({ type: 'close' })}\n\n`);
      res.end();
    }
  };

  const interval = setInterval(sendEvent, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// GET /api/download/:id - Download file
app.get('/api/download/:id', (req, res) => {
  const task = tasks.get(req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (task.status !== 'completed') {
    return res.status(400).json({ error: 'Task not completed yet' });
  }

  if (!task.fileReady || !task.fileData) {
    return res.status(410).json({ error: 'File expired or deleted' });
  }

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="processed_${task.filename}"`);
  res.send(task.fileData);
});

// DELETE /api/task/:id - Cancel task
app.delete('/api/task/:id', (req, res) => {
  const task = tasks.get(req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (task.status === 'completed') {
    return res.status(400).json({ error: 'Task already completed, cannot cancel' });
  }

  task.status = 'cancelled';
  task.updated_at = new Date().toISOString();
  tasks.set(req.params.id, task);

  res.json({
    task_id: req.params.id,
    status: 'cancelled',
    message: 'Task cancelled successfully'
  });
});

// POST /api/upload/chunk - Upload chunk
app.post('/api/upload/chunk', upload.single('chunk'), (req, res) => {
  const { uploadId, chunkIndex, totalChunks, filename } = req.body;

  if (!uploadId || chunkIndex === undefined || !totalChunks || !req.file) {
    return res.status(400).json({ error: 'Invalid chunk index or missing parameters' });
  }

  const index = parseInt(chunkIndex);
  const total = parseInt(totalChunks);

  if (!chunks.has(uploadId)) {
    chunks.set(uploadId, {
      filename,
      totalChunks: total,
      receivedChunks: new Map(),
      created_at: new Date().toISOString()
    });
  }

  const uploadSession = chunks.get(uploadId);
  uploadSession.receivedChunks.set(index, req.file.buffer);

  res.json({
    uploadId,
    chunkIndex: index,
    received: true,
    message: `Chunk ${index + 1}/${total} uploaded successfully`
  });
});

// POST /api/upload/complete - Complete chunked upload
app.post('/api/upload/complete', (req, res) => {
  const { uploadId, filename, totalChunks } = req.body;

  if (!uploadId || !filename || !totalChunks) {
    return res.status(400).json({ error: 'Missing chunks or invalid uploadId' });
  }

  const uploadSession = chunks.get(uploadId);

  if (!uploadSession) {
    return res.status(404).json({ error: 'Upload session not found' });
  }

  if (uploadSession.receivedChunks.size !== parseInt(totalChunks)) {
    return res.status(400).json({ 
      error: 'Missing chunks',
      received: uploadSession.receivedChunks.size,
      expected: totalChunks
    });
  }

  // Combine chunks
  const buffers = [];
  for (let i = 0; i < parseInt(totalChunks); i++) {
    buffers.push(uploadSession.receivedChunks.get(i));
  }
  const combinedBuffer = Buffer.concat(buffers);

  // Create task
  const taskId = uuidv4();
  const task = {
    task_id: taskId,
    status: 'queued',
    progress: 0,
    filename,
    size: combinedBuffer.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    fileData: combinedBuffer
  };

  tasks.set(taskId, task);
  chunks.delete(uploadId);

  // Start processing
  setTimeout(() => simulateProcessing(taskId), 500);

  res.status(201).json({
    task_id: taskId,
    uploadId,
    status: 'queued',
    filename,
    totalChunks: parseInt(totalChunks),
    message: 'Upload completed, processing queued'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    tasks: tasks.size,
    uploads: chunks.size,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API Server running on http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('  POST   /api/upload');
  console.log('  GET    /api/task/:id');
  console.log('  GET    /api/events/:id');
  console.log('  GET    /api/download/:id');
  console.log('  DELETE /api/task/:id');
  console.log('  POST   /api/upload/chunk');
  console.log('  POST   /api/upload/complete');
  console.log('  GET    /health');
});

module.exports = app;