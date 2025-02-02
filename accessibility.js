const cheerio = require("cheerio");
const colorContrast = require("color-contrast");
const getSuggestedFixes = require("./openai");

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
const analyzeAccessibility = async (htmlContent) => {
  const $ = cheerio.load(htmlContent);
  let issues = [];
  let totalChecks = 0;
  let failedChecks = 0;
  let lastHeadingLevel = 0;

  // Asynchronously check for missing alt attributes on images
  const imgIssues = $("img").map(async (_, img) => {
    totalChecks++;
    if (!$(img).attr("alt")) {
      failedChecks++;
      const suggestedFix = await getSuggestedFixes("Missing alt attribute on image");
      issues.push({
        issue: "Missing alt attribute on image",
        element: $.html(img),
        suggestedFix,
      });
    }
  }).get();

  // Asynchronously check for skipped heading levels
  const headingIssues = $("h1, h2, h3, h4, h5, h6").map(async (_, heading) => {
    totalChecks++;
    const level = parseInt(heading.tagName.charAt(1));
    if (lastHeadingLevel && level > lastHeadingLevel + 1) {
      failedChecks++;
      const suggestedFix = await getSuggestedFixes(`Skipped heading level from h${lastHeadingLevel} to h${level}`);
      issues.push({
        issue: `Skipped heading level from h${lastHeadingLevel} to h${level}`,
        element: $.html(heading),
        suggestedFix,
      });
    }
    lastHeadingLevel = level;
  }).get();

  // Asynchronously check for empty links
  const linkIssues = $("a").map(async (_, link) => {
    totalChecks++;
    if (!$(link).text().trim() && !$(link).attr("aria-label")) {
      failedChecks++;
      const suggestedFix = await getSuggestedFixes("Empty link");
      issues.push({
        issue: "Empty link",
        element: $.html(link),
        suggestedFix,
      });
    }
  }).get();

  // Asynchronously check for missing form labels
  const formLabelIssues = $('input:not([type="hidden"])').map(async (_, input) => {
    totalChecks++;
    if (
      !$(input).attr("id") ||
      !$(`label[for="${$(input).attr("id")}"]`).length
    ) {
      failedChecks++;
      const suggestedFix = await getSuggestedFixes("Form input missing associated label");
      issues.push({
        issue: "Form input missing associated label",
        element: $.html(input),
        suggestedFix,
      });
    }
  }).get();

  // Asynchronously check for low contrast text
  const contrastIssues = $("p, span, div").map(async (_, el) => {
    totalChecks++;
    const color = $(el).css("color");
    const bgColor = $(el).css("background-color") || "white";
    if (color && bgColor && colorContrast(color, bgColor) < 4.5) {
      failedChecks++;
      const suggestedFix = await getSuggestedFixes("Low contrast text");
      issues.push({
        issue: "Low contrast text",
        element: $.html(el),
        suggestedFix,
      });
    }
  }).get();

  // Asynchronously check for missing ARIA roles on interactive elements
  const ariaIssues = $("div, span").map(async (_, el) => {
    totalChecks++;
    if ($(el).attr("onclick") && !$(el).attr("role")) {
      failedChecks++;
      const suggestedFix = await getSuggestedFixes("Interactive element missing ARIA role");
      issues.push({
        issue: "Interactive element missing ARIA role",
        element: $.html(el),
        suggestedFix,
      });
    }
  }).get();

  // Wait for all asynchronous tasks to finish
  await Promise.all([
    ...imgIssues,
    ...headingIssues,
    ...linkIssues,
    ...formLabelIssues,
    ...contrastIssues,
    ...ariaIssues,
  ]);

  const complianceScore = ((totalChecks - failedChecks) / totalChecks) * 100;
  return { score: complianceScore.toFixed(2), issues };
};

module.exports = analyzeAccessibility;
