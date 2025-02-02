const express = require('express');
const multer = require('multer');
const { JSDOM } = require('jsdom');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

// Function to analyze accessibility issues
function analyzeAccessibility(htmlContent) {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    const issues = [];

    // Rule 1: Check for missing alt attributes in images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
        if (!img.alt) {
            issues.push({
                type: 'missing_alt',
                message: `Image at position ${index + 1} is missing an alt attribute.`,
                fix: 'Add an alt attribute describing the image content.',
            });
        }
    });

    // Rule 2: Check for skipped heading levels
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading) => {
        const currentLevel = parseInt(heading.tagName[1]);
        if (currentLevel > previousLevel + 1) {
            issues.push({
                type: 'skipped_heading',
                message: `Heading "${heading.textContent}" skips a level.`,
                fix: `Ensure headings are in order (e.g., h1 → h2 → h3).`,
            });
        }
        previousLevel = currentLevel;
    });

    // Calculate compliance score
    const totalIssues = issues.length;
    const complianceScore = totalIssues === 0 ? 100 : Math.max(0, 100 - totalIssues * 10);

    return { complianceScore, issues };
}

// API endpoint for file upload and analysis
app.post('/upload', upload.single('htmlFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const htmlContent = require('fs').readFileSync(req.file.path, 'utf8');
    const analysisResult = analyzeAccessibility(htmlContent);

    res.json(analysisResult);
});

const PORT = 8888;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});