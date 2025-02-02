const cheerio = require("cheerio");
const colorContrast = require("color-contrast");
const getSuggestedFixes = require("./openai");

const accessibilityRules = {
    missing_alt: {
        message: "Images must have descriptive alt attributes.",
        fix: "Add an alt attribute to the <img> tag. Example: <img src='image.jpg' alt='Description of the image'>",
    },
    skipped_heading: {
        message: "Headings must be in a logical order (e.g., h1 → h2 → h3).",
        fix: "Ensure headings follow a sequential order. Example: Use <h1> for the main title, <h2> for subheadings, and so on.",
    },
    empty_link: {
        message: "Links must have meaningful text or an aria-label.",
        fix: "Add descriptive text inside the <a> tag or use an aria-label. Example: <a href='/about'>About Us</a>",
    },
    low_contrast: {
        message: "Text must have sufficient contrast against its background.",
        fix: "Use a color contrast checker to ensure a minimum contrast ratio of 4.5:1 for normal text.",
    },
    missing_form_label: {
        message: "Form inputs must have associated labels.",
        fix: "Add a <label> element for each form input. Example: <label for='name'>Name:</label><input id='name' type='text'>",
    },
    missing_aria_role: {
        message: "Interactive elements must have appropriate ARIA roles.",
        fix: "Add a role attribute to interactive elements. Example: <div role='button' onclick='handleClick()'>Click me</div>",
    },
};
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
const analyzeAccessibility = async (htmlContent, useAI = false) => {
    const $ = cheerio.load(htmlContent);
    let issues = [];
    let totalChecks = 0;
    let failedChecks = 0;
    let lastHeadingLevel = 0;

    const addIssue = async (type, element) => {
        failedChecks++;
        const suggestedFix = useAI ? await getSuggestedFixes(type) : accessibilityRules[type].fix;
        issues.push({ issue: accessibilityRules[type].message, element: $.html(element), fix: suggestedFix });
    };

    // Ensure total checks are counted correctly
    $("img").each((_, img) => {
        totalChecks++;
        if (!$(img).attr("alt")) addIssue("missing_alt", img);
    });

    $("h1, h2, h3, h4, h5, h6").each((_, heading) => {
        totalChecks++;
        const level = parseInt(heading.tagName.charAt(1));
        if (lastHeadingLevel && level > lastHeadingLevel + 1) {
            addIssue("skipped_heading", heading);
        }
        lastHeadingLevel = level;
    });

    $("a").each((_, link) => {
        totalChecks++;
        if (!$(link).text().trim() && !$(link).attr("aria-label")) addIssue("empty_link", link);
    });

    $('input:not([type="hidden"])').each((_, input) => {
        totalChecks++;
        if (!$(input).attr("id") || !$(`label[for='${$(input).attr("id")}]`).length) {
            addIssue("missing_form_label", input);
        }
    });

    $("p, span, div").each((_, el) => {
        totalChecks++;
        const color = $(el).css("color");
        const bgColor = $(el).css("background-color") || "white";
        if (color && bgColor && colorContrast(color, bgColor) < 4.5) {
            addIssue("low_contrast", el);
        }
    });

    $("div, span, button").each((_, el) => {
        totalChecks++;
        if ($(el).attr("onclick") && !$(el).attr("role")) {
            addIssue("missing_aria_role", el);
        }
    });

    // Prevent division by zero
    const complianceScore = totalChecks > 0 ? ((totalChecks - failedChecks) / totalChecks) * 100 : 100;

    return { score: complianceScore.toFixed(2), issues };
};

module.exports = analyzeAccessibility;
