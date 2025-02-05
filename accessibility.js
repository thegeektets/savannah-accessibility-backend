const htmlparser2 = require("htmlparser2");
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
  const handler = new htmlparser2.DomHandler();
  const parser = new htmlparser2.Parser(handler);
  parser.write(htmlContent);
  parser.end();

  let issues = [];
  let totalChecks = 0;
  let failedChecks = 0;
  let lastHeadingLevel = 0;

  const addIssue = async (type, element) => {
    failedChecks++;
    // do not enable AI without a valid key
    const suggestedFix = useAI
      ? getSuggestedFixes(accessibilityRules[type].message)
      : accessibilityRules[type].fix;
    issues.push({
      issue: accessibilityRules[type].message,
      element: htmlparser2.DomUtils.getOuterHTML(element),
      fix: suggestedFix,
    });
  };

  // Traverse the parsed DOM
  const traverseDom = (node) => {
    if (node.type === "tag") {
      // Check for alt attributes on images
      if (node.name === "img") {
        totalChecks++;
        if (!node.attribs.alt) addIssue("missing_alt", node);
      }

      // Check for heading order
      if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.name)) {
        totalChecks++;
        const level = parseInt(node.name.charAt(1));
        if (lastHeadingLevel && level > lastHeadingLevel + 1) {
          addIssue("skipped_heading", node);
        }
        lastHeadingLevel = level;
      }

      // Check for empty links
      if (node.name === "a") {
        totalChecks++;
        if (
          !node.children.some(
            (child) => child.type === "text" && child.data.trim()
          ) &&
          !node.attribs["aria-label"]
        ) {
          addIssue("empty_link", node);
        }
      }

      // Check for missing form labels
      if (node.name === "input") {
        totalChecks++;
        if (
          !node.attribs.id ||
          !handler.dom.some(
            (el) =>
              el.type === "tag" &&
              el.name === "label" &&
              el.attribs.for === node.attribs.id
          )
        ) {
          addIssue("missing_form_label", node);
        }
      }

      // Check for low contrast text
      if (["p", "span", "div"].includes(node.name)) {
        totalChecks++;
        const color =
          node.attribs.style && node.attribs.style.includes("color")
            ? node.attribs.style.match(/color:\s*(#[a-zA-Z0-9]+|[a-zA-Z]+)/i)[1]
            : null;
        const bgColor =
          node.attribs.style && node.attribs.style.includes("background-color")
            ? node.attribs.style.match(
                /background-color:\s*(#[a-zA-Z0-9]+|[a-zA-Z]+)/i
              )[1]
            : "white";
        if (color && bgColor && colorContrast(color, bgColor) < 4.5) {
          addIssue("low_contrast", node);
        }
      }

      // Check for missing ARIA role
      if (["div", "span", "button"].includes(node.name)) {
        totalChecks++;
        if (node.attribs.onclick && !node.attribs.role) {
          addIssue("missing_aria_role", node);
        }
      }
    }

    // Recurse through child nodes
    if (node.children) {
      node.children.forEach(traverseDom);
    }
  };

  // Start traversing the DOM
  handler.dom.forEach(traverseDom);

  // Prevent division by zero
  const complianceScore =
    totalChecks > 0 ? ((totalChecks - failedChecks) / totalChecks) * 100 : 100;

  return { score: complianceScore.toFixed(2), issues };
};

module.exports = analyzeAccessibility;
