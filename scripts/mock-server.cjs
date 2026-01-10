/**
 * Mock API Server for File Processing API
 * Based on Postman Collection
 *
 * Endpoints:
 * - POST   /api/upload
 * - GET    /api/task/:id
 * - GET    /api/events/:id (SSE)
 * - GET    /api/download/:id
 * - DELETE /api/task/:id
 * - POST   /api/upload/chunk
 * - POST   /api/upload/complete
 */

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage
const tasks = new Map();
const chunkedUploads = new Map();

// Multer configuration for file uploads
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Simulate file processing with progress updates
 */
function simulateProcessing(taskId) {
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 20 + 10;

    const task = tasks.get(taskId);
    if (!task || task.status === "cancelled") {
      clearInterval(interval);
      return;
    }

    task.progress = Math.min(100, Math.round(progress));
    task.updated_at = new Date().toISOString();

    if (task.progress >= 100) {
      task.status = "completed";
      task.fileReady = true;
      clearInterval(interval);
    } else {
      task.status = "processing";
    }

    tasks.set(taskId, task);
  }, 1500);
}

// ==================== File Operations ====================

/**
 * POST /api/upload
 * Upload a file and receive a task_id for tracking
 */
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const taskId = uuidv4();
  const task = {
    task_id: taskId,
    status: "queued",
    progress: 0,
    filename: req.file.originalname,
    size: req.file.size,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    fileData: req.file.buffer,
    fileReady: false,
  };

  tasks.set(taskId, task);

  // Start processing simulation
  setTimeout(() => simulateProcessing(taskId), 500);

  res.status(201).json({
    task_id: taskId,
    status: "queued",
    message: "File uploaded successfully",
  });
});

/**
 * GET /api/task/:id
 * Get the current status of a processing task
 */
app.get("/api/task/:id", (req, res) => {
  const task = tasks.get(req.params.id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json({
    task_id: task.task_id,
    status: task.status,
    progress: task.progress,
    filename: task.filename,
    created_at: task.created_at,
    updated_at: task.updated_at,
    error: task.error || null,
  });
});

/**
 * GET /api/events/:id
 * Server-Sent Events stream for real-time progress updates
 */
app.get("/api/events/:id", (req, res) => {
  const task = tasks.get(req.params.id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial state
  sendEvent({
    type: "progress",
    task_id: task.task_id,
    status: task.status,
    progress: task.progress,
    message: `Processing: ${task.progress}%`,
  });

  // Send updates every second
  const interval = setInterval(() => {
    const currentTask = tasks.get(req.params.id);

    if (!currentTask) {
      clearInterval(interval);
      sendEvent({ type: "error", message: "Task not found" });
      res.end();
      return;
    }

    sendEvent({
      type: "progress",
      task_id: currentTask.task_id,
      status: currentTask.status,
      progress: currentTask.progress,
      message: `Processing: ${currentTask.progress}%`,
    });

    if (currentTask.status === "completed") {
      clearInterval(interval);
      sendEvent({ type: "complete", task_id: currentTask.task_id });
      res.end();
    } else if (
      currentTask.status === "failed" ||
      currentTask.status === "cancelled"
    ) {
      clearInterval(interval);
      sendEvent({ type: "close", task_id: currentTask.task_id });
      res.end();
    }
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
  });
});

/**
 * GET /api/download/:id
 * Download the processed file
 */
app.get("/api/download/:id", (req, res) => {
  const task = tasks.get(req.params.id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (task.status !== "completed") {
    return res.status(400).json({ error: "File processing not completed" });
  }

  if (!task.fileReady) {
    return res.status(410).json({ error: "File no longer available" });
  }

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="processed_${task.filename}"`,
  );
  res.send(task.fileData);
});

/**
 * DELETE /api/task/:id
 * Cancel a processing task
 */
app.delete("/api/task/:id", (req, res) => {
  const task = tasks.get(req.params.id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (task.status === "completed") {
    return res.status(400).json({ error: "Cannot cancel completed task" });
  }

  task.status = "cancelled";
  task.updated_at = new Date().toISOString();
  tasks.set(req.params.id, task);

  res.json({
    task_id: req.params.id,
    status: "cancelled",
    message: "Task cancelled successfully",
  });
});

// ==================== Chunked Upload (>1GB files) ====================

/**
 * POST /api/upload/chunk
 * Upload a file chunk (for files larger than 1GB)
 */
app.post("/api/upload/chunk", upload.single("chunk"), (req, res) => {
  const { uploadId, chunkIndex, totalChunks, filename } = req.body;

  if (!uploadId || chunkIndex === undefined || !totalChunks || !req.file) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const index = parseInt(chunkIndex);
  const total = parseInt(totalChunks);

  if (!chunkedUploads.has(uploadId)) {
    chunkedUploads.set(uploadId, {
      id: uploadId,
      filename: filename || "unknown",
      totalChunks: total,
      receivedChunks: new Map(),
      created_at: new Date().toISOString(),
    });
  }

  const uploadSession = chunkedUploads.get(uploadId);
  uploadSession.receivedChunks.set(index, req.file.buffer);

  res.json({
    uploadId,
    chunkIndex: index,
    received: uploadSession.receivedChunks.size,
    totalChunks: total,
    message: `Chunk ${index + 1} of ${total} uploaded`,
  });
});

/**
 * POST /api/upload/complete
 * Finalize chunked upload and get task_id
 */
app.post("/api/upload/complete", (req, res) => {
  const { uploadId, filename, totalChunks } = req.body;

  if (!uploadId) {
    return res.status(400).json({ error: "uploadId is required" });
  }

  const uploadSession = chunkedUploads.get(uploadId);

  if (!uploadSession) {
    return res.status(404).json({ error: "Upload session not found" });
  }

  const expectedChunks = parseInt(totalChunks) || uploadSession.totalChunks;

  if (uploadSession.receivedChunks.size !== expectedChunks) {
    return res.status(400).json({
      error: "Incomplete upload",
      received: uploadSession.receivedChunks.size,
      expected: expectedChunks,
    });
  }

  // Combine all chunks
  const buffers = [];
  for (let i = 0; i < expectedChunks; i++) {
    buffers.push(uploadSession.receivedChunks.get(i));
  }
  const combinedBuffer = Buffer.concat(buffers);

  // Create processing task
  const taskId = uuidv4();
  const task = {
    task_id: taskId,
    status: "queued",
    progress: 0,
    filename: filename || uploadSession.filename,
    size: combinedBuffer.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    fileData: combinedBuffer,
    fileReady: false,
  };

  tasks.set(taskId, task);
  chunkedUploads.delete(uploadId);

  // Start processing
  setTimeout(() => simulateProcessing(taskId), 500);

  res.status(201).json({
    task_id: taskId,
    status: "queued",
    filename: task.filename,
    size: task.size,
    message: "Chunked upload completed, processing started",
  });
});

// ==================== Health Check ====================

app.get("/health", (req, res) => {
  // res.status(403).json({ error: "Forbidden" });
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    stats: {
      active_tasks: tasks.size,
      chunked_uploads: chunkedUploads.size,
    },
  });
});

// ==================== Start Server ====================

app.listen(PORT, () => {
  console.log(`\n🚀 Mock File Processing API Server`);
  console.log(`📍 Running at: http://localhost:${PORT}`);
  console.log(`\n📋 Endpoints:\n`);

  console.log(`  File Operations:`);
  console.log(`    POST   /api/upload`);
  console.log(`    GET    /api/task/:id`);
  console.log(`    GET    /api/events/:id`);
  console.log(`    GET    /api/download/:id`);
  console.log(`    DELETE /api/task/:id`);

  console.log(`\n  Chunked Upload:`);
  console.log(`    POST   /api/upload/chunk`);
  console.log(`    POST   /api/upload/complete`);

  console.log(`\n  Health:`);
  console.log(`    GET    /health\n`);
});

module.exports = app;
