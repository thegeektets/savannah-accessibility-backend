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
    const data = fs.readFileSync(req.file.path, "utf8");
    const analysisResult = await analyzeAccessibility(data);

    // Delete the uploaded file after processing
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });

    res.json(analysisResult);
  } catch (err) {
    console.error("Error reading or analyzing the file:", err);
    res.status(500).json({ error: "Error processing the file." });
  }
});

// Start the server
const port = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
