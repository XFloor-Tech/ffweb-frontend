const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { randomUUID } = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for handling multipart/form-data
const storage = multer.memoryStorage();
const upload = multer({ storage });

// In-memory data store for tasks
let db = {
  tasks: [],
};

// Chunk storage for chunked uploads
let chunkStorage = new Map(); // taskId -> { chunks: [], metadata: {}, totalChunks: 0 }

// SSE clients for events
let sseClients = new Map(); // taskId -> Set of response objects

// Health check
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
);

// Simulate delay (default 2s, override with ?delay=ms or ?delay=0 for instant)
app.use((req, res, next) => {
  const delay =
    req.query.delay !== undefined ? parseInt(req.query.delay) : 2000;
  setTimeout(next, delay);
});

// Helper: Simulate conversion progress
function simulateConversion(taskId) {
  const task = db.tasks.find((t) => t.id === taskId);
  if (!task) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      progress = 100;
      task.status = "completed";
      task.progress = 100;
      task.updated_at = new Date().toISOString();
      clearInterval(interval);

      // Notify SSE clients
      const clients = sseClients.get(taskId);
      if (clients) {
        clients.forEach((client) => {
          client.write(
            `data: ${JSON.stringify({ status: "completed", progress: 100 })}\n\n`,
          );
        });
      }
    } else {
      task.progress = Math.floor(progress);
      task.updated_at = new Date().toISOString();

      // Notify SSE clients
      const clients = sseClients.get(taskId);
      if (clients) {
        clients.forEach((client) => {
          client.write(
            `data: ${JSON.stringify({ status: "processing", progress: task.progress })}\n\n`,
          );
        });
      }
    }
  }, 1000);
}

// ============================================================================
// FFmpeg Conversion API Endpoints (from Swagger documentation)
// ============================================================================

// POST /api/upload/initiate - Initiate chunked upload
app.post("/api/upload/initiate", (req, res) => {
  const { file_name, output_format, quality, total_chunks } = req.body;

  if (!file_name || !output_format || !quality || !total_chunks) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!["low", "medium", "high"].includes(quality)) {
    return res.status(400).json({ error: "Invalid quality" });
  }

  const taskId = randomUUID();
  chunkStorage.set(taskId, {
    chunks: [],
    metadata: { file_name, output_format, quality },
    totalChunks,
  });

  const task = {
    id: taskId,
    input_file_path: `/uploads/${file_name}`,
    output_file_path: "",
    status: "uploading",
    progress: 0,
    error: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.tasks.push(task);

  res.status(201).json({
    task_id: taskId,
    status: "uploading",
    total_chunks,
  });
});

// POST /api/upload/chunk - Upload a file chunk
app.post("/api/upload/chunk", upload.single("chunk"), (req, res) => {
  const { task_id, chunk_number, total_chunks, chunk_hash } = req.body;

  if (!task_id || chunk_number === undefined || !total_chunks || !req.file) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const storage = chunkStorage.get(task_id);
  if (!storage) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Store chunk
  storage.chunks[parseInt(chunk_number)] = {
    data: req.file.buffer,
    hash: chunk_hash,
  };

  // Update task
  const task = db.tasks.find((t) => t.id === task_id);
  if (task) {
    task.progress = Math.floor(
      ((parseInt(chunk_number) + 1) / total_chunks) * 50,
    );
    task.updated_at = new Date().toISOString();
  }

  res.json({
    message: "Чанк загружен",
    chunk_number: parseInt(chunk_number),
    total_chunks: parseInt(total_chunks),
  });
});

// POST /api/upload/complete - Complete chunked upload
app.post("/api/upload/complete", (req, res) => {
  const { task_id, file_name, output_format, quality, total_chunks } = req.body;

  if (!task_id || !file_name || !output_format || !quality || !total_chunks) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const storage = chunkStorage.get(task_id);
  if (!storage) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Verify all chunks are received
  if (storage.chunks.length !== total_chunks) {
    return res.status(400).json({ error: "Missing chunks" });
  }

  // Update task
  const task = db.tasks.find((t) => t.id === task_id);
  if (task) {
    task.status = "processing";
    task.output_file_path = `/outputs/${file_name.replace(/\.[^.]+$/, `.${output_format}`)}`;
    task.updated_at = new Date().toISOString();

    // Start conversion simulation
    simulateConversion(task_id);
  }

  // Clean up chunk storage
  chunkStorage.delete(task_id);

  res.json({
    message: "Загрузка завершена, начата конвертация",
    task_id,
  });
});

// POST /api/upload - Upload file for conversion (single file)
app.post("/api/upload", upload.single("file"), (req, res) => {
  const { file } = req;
  const { output_format, quality, options } = req.body;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (!output_format || !quality) {
    return res.status(400).json({ error: "Missing output_format or quality" });
  }

  if (!["low", "medium", "high"].includes(quality)) {
    return res.status(400).json({ error: "Invalid quality" });
  }

  const taskId = randomUUID();
  const task = {
    id: taskId,
    input_file_path: `/uploads/${file.originalname}`,
    output_file_path: `/outputs/${file.originalname.replace(/\.[^.]+$/, `.${output_format}`)}`,
    status: "processing",
    progress: 0,
    error: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.tasks.push(task);

  // Start conversion simulation
  simulateConversion(taskId);

  // res.status(400).json({ error: "Invalid quality" });
  res.status(201).json({
    task_id: taskId,
    status: "processing",
  });
});

// GET /api/task/:id - Get task status
app.get("/api/task/:id", (req, res) => {
  const { id } = req.params;

  const task = db.tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: "Задача не найдена" });
  }

  res.json(task);
});

// DELETE /api/task/:id - Cancel a task
app.delete("/api/task/:id", (req, res) => {
  const { id } = req.params;

  const taskIndex = db.tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return res.status(400).json({ error: "Задача не найдена" });
  }

  db.tasks[taskIndex].status = "cancelled";
  db.tasks[taskIndex].updated_at = new Date().toISOString();

  // Notify SSE clients
  const clients = sseClients.get(id);
  if (clients) {
    clients.forEach((client) => {
      client.write(`data: ${JSON.stringify({ status: "cancelled" })}\n\n`);
    });
  }

  res.json({ message: "Задача отменена" });
});

// GET /api/download/:id - Download converted file
app.get("/api/download/:id", (req, res) => {
  const { id } = req.params;

  const task = db.tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: "Файл не найден" });
  }

  if (task.status !== "completed") {
    return res.status(400).json({ error: "Конвертация не завершена" });
  }

  // Return a mock file
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${task.output_file_path.split("/").pop()}"`,
  );

  // res.status(400).json({ error: "Конвертация не завершена" });
  res.send(Buffer.from("Mock converted file content"));
});

// GET /api/events/:id - Stream task events (SSE)
app.get("/api/events/:id", (req, res) => {
  const { id } = req.params;

  const task = db.tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: "Задача не найдена" });
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Add client to SSE clients
  if (!sseClients.has(id)) {
    sseClients.set(id, new Set());
  }
  sseClients.get(id).add(res);

  // Send current status
  res.write(
    `data: ${JSON.stringify({ status: task.status, progress: task.progress })}\n\n`,
  );

  // Remove client on disconnect
  req.on("close", () => {
    const clients = sseClients.get(id);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        sseClients.delete(id);
      }
    }
  });
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Endpoint not found" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log(`\nFFmpeg Conversion API endpoints:`);
  console.log(`  POST   /api/upload`);
  console.log(`  POST   /api/upload/initiate`);
  console.log(`  POST   /api/upload/chunk`);
  console.log(`  POST   /api/upload/complete`);
  console.log(`  GET    /api/task/:id`);
  console.log(`  DELETE /api/task/:id`);
  console.log(`  GET    /api/download/:id`);
  console.log(`  GET    /api/events/:id (SSE)`);
  console.log(`\nUtilities:`);
  console.log(`  GET    /health`);
  console.log(`\nAdd ?delay=1000 to any request to simulate network delay`);
});
