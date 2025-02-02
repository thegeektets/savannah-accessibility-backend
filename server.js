const express = require('express');
const multer = require('multer');
const { JSDOM } = require('jsdom');
const cors = require('cors');
const cheerio = require('cheerio');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());


/**
 * Analyze the accessibility of an HTML document.
 * 
 * Checks performed:
 * - Missing alt attributes on images
 * - Skipped heading levels
 * - Empty links
 * - Missing form labels
 * - Low contrast text
 * - Missing ARIA roles on interactive elements
 * 
 * @param {string} htmlContent - The HTML content to analyze.
 * @returns {Object} - Accessibility compliance score and detected issues.
 */
const analyzeAccessibility = (htmlContent) => {
    const $ = cheerio.load(htmlContent);
    let issues = [];
    let totalChecks = 0;
    let failedChecks = 0;

    // Check for missing alt attributes on images
    $('img').each((_, img) => {
        totalChecks++;
        if (!$(img).attr('alt')) {
            failedChecks++;
            issues.push({
                issue: 'Missing alt attribute on image',
                element: $.html(img)
            });
        }
    });

    // Check for skipped heading levels
    let lastHeadingLevel = 0;
    $('h1, h2, h3, h4, h5, h6').each((_, heading) => {
        totalChecks++;
        const level = parseInt(heading.tagName.charAt(1));
        if (lastHeadingLevel && level > lastHeadingLevel + 1) {
            failedChecks++;
            issues.push({
                issue: `Skipped heading level from h${lastHeadingLevel} to h${level}`,
                element: $.html(heading)
            });
        }
        lastHeadingLevel = level;
    });

    // Check for empty links
    $('a').each((_, link) => {
        totalChecks++;
        if (!$(link).text().trim() && !$(link).attr('aria-label')) {
            failedChecks++;
            issues.push({ issue: 'Empty link', element: $.html(link) });
        }
    });

    // Check for missing form labels
    $('input:not([type="hidden"])').each((_, input) => {
        totalChecks++;
        if (!$(input).attr('id') || !$(`label[for="${$(input).attr('id')}"]`).length) {
            failedChecks++;
            issues.push({ issue: 'Form input missing associated label', element: $.html(input) });
        }
    });

    // Check for low contrast text
    $('p, span, div').each((_, el) => {
        totalChecks++;
        const color = $(el).css('color');
        const bgColor = $(el).css('background-color') || 'white';
        if (color && bgColor && Color(color).contrast(Color(bgColor)) < 4.5) {
            failedChecks++;
            issues.push({ issue: 'Low contrast text', element: $.html(el) });
        }
    });

    // Check for missing ARIA roles on interactive elements
    $('div, span').each((_, el) => {
        totalChecks++;
        if ($(el).attr('onclick') && !$(el).attr('role')) {
            failedChecks++;
            issues.push({ issue: 'Interactive element missing ARIA role', element: $.html(el) });
        }
    });

    const complianceScore = ((totalChecks - failedChecks) / totalChecks) * 100;
    return { score: complianceScore.toFixed(2), issues };
};

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