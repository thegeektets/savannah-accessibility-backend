const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const analyzeAccessibility = require("./accessibility");
const app = express();

// Set up multer storage options
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

// API endpoint for file upload and analysis
app.post("/upload", upload.single("htmlFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    // Read the uploaded file content
    fs.readFileSync(req.file.path, "utf8", async (err, data) => {
        if (err) {
          return res.status(500).json({ error: "Error reading the file." });
        }
        const analysisResult = await analyzeAccessibility(data);
        res.json(analysisResult);
      });
    // Delete the uploaded file after processing
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });
  } catch (err) {
    console.error("Error reading or analyzing the file:", err);
    res.status(500).json({ error: "Error processing the file." });
  }
});

// Start the server
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


