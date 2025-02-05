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

- **Backend**: Node.js, Express, Multer, JSDOM, Cheerio, OpenAI

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

3. Configure environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:

     ```sh
     OPENAI_API_KEY=your_openai_api_key_here
     PORT=8888
     ```

4. Start the server:

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
      "element": "<img src='image.jpg'>",
      "fix":"Add an alt attribute to the <img> tag. Example: <img src='image.jpg' alt='Description of the image'>"
    },
    {
      "issue": "Skipped heading level from h2 to h4",
      "element": "<h4>Section Title</h4>",
       "fix":"Ensure headings follow a sequential order. Example: Use <h1> for the main title, <h2> for subheadings, and so on."

    }
  ]
}
```

## Scoring System

- **100%**: Perfect compliance
- **80-99%**: Good compliance with minor issues
- **50-79%**: Needs improvement
- **Below 50%**: Poor accessibility compliance

## Deployment Instructions

To deploy the API on a cloud provider, follow these general steps:

### Deploying to AWS (EC2 or Lambda)

1. **Set up an EC2 instance**:
   - Install Node.js and Git on the server.
   - Clone the repository and install dependencies.
   - Set up environment variables in `.env`.
   - Start the server using `pm2` for process management.
2. **Deploy using AWS Lambda**:
   - Package the app using `serverless` framework.
   - Deploy using `serverless deploy`.

### Deploying to Heroku

1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).
2. Run:

   ```sh
   heroku create accessibility-checker-api
   git push heroku main
   heroku config:set OPENAI_API_KEY=your_api_key
   heroku ps:scale web=1
   ```

### Deploying to Vercel

1. Install the [Vercel CLI](https://vercel.com/docs/cli).
2. Run:

   ```sh
   vercel
   ```

## Design Document

### Architecture Overview

The system follows a **RESTful API** architecture and consists of:

- **Express.js Server**: Handles API requests and file uploads.
- **Multer Middleware**: Processes file uploads.
- **htmlparser2**: Parses and analyzes HTML content.
- **OpenAI API**: Provides suggested fixes for detected accessibility issues.

### Scoring Logic

The accessibility score is calculated as follows:

1. **Total checks**: The number of accessibility rules applied to the HTML.
2. **Failed checks**: The number of detected accessibility issues.
3. **Compliance Score Formula**:

   ```
   complianceScore = ((totalChecks - failedChecks) / totalChecks) * 100;
   ```

## Future Improvements

- Implement more WCAG compliance checks
- Add logging and monitoring features
- Support for real-time accessibility analysis via browser extensions

## License

This project is open-source and available under the MIT License.
