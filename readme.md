# Accessibility Checker API

## Overview
This project provides an API for analyzing HTML files to detect accessibility issues based on WCAG principles. It evaluates various aspects of accessibility and returns a compliance score along with a list of detected issues.

## Features
- Detects missing `alt` attributes on images
- Identifies skipped heading levels (e.g., h1 → h3 without h2)
- Checks for empty links without labels
- Ensures form inputs have associated labels
- Analyzes text contrast against background colors
- Verifies interactive elements have ARIA roles

## Tech Stack
- **Backend**: Node.js, Express, Multer, JSDOM

## Repositories
- **Backend Repository**: [GitHub - Backend](https://github.com/thegeektets/savannah-accessibility-backend)

## Installation
### Prerequisites
Ensure you have **Node.js** installed on your machine.

### Steps
1. Clone the backend repository:
   ```sh
   git clone https://github.com/thegeektets/savannah-accessibility-backend.git
   cd savannah-accessibility-backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm start
   ```
   The server will run on `http://localhost:8888` by default.

## API Endpoints
### Upload HTML File
**Endpoint:** `POST /upload`

**Description:** Accepts an HTML file and analyzes it for accessibility issues.

**Request:**
- `Content-Type: multipart/form-data`
- Parameter: `htmlFile` (HTML file to analyze)

**Response:**
```json
{
  "score": "85.67",
  "issues": [
    {
      "issue": "Missing alt attribute on image",
      "element": "<img src='image.jpg'>"
    },
    {
      "issue": "Skipped heading level from h2 to h4",
      "element": "<h4>Section Title</h4>"
    }
  ]
}
```

## Scoring System
- **100%**: Perfect compliance
- **80-99%**: Good compliance with minor issues
- **50-79%**: Needs improvement
- **Below 50%**: Poor accessibility compliance

## Deployment
To deploy the API on a cloud provider, follow these general steps:
1. Choose a cloud provider (e.g., AWS, Heroku, Vercel)
2. Set up an environment with Node.js
3. Deploy the application using a hosting service

## Future Improvements
- Implement more WCAG compliance checks
- Add logging and monitoring features

## License
This project is open-source and available under the MIT License.

