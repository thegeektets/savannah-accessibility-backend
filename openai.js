require('dotenv').config();

const { OpenAI } = require('openai');

// Initialize OpenAI with the API key from the environment variable
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Get suggested fixes for a given accessibility issue using OpenAI.
 * 
 * This function sends a request to the OpenAI API to generate suggested fixes
 * for an accessibility issue based on a provided description.
 * The response is expected to provide a fix in plain text format.
 * 
 * @param {string} issue - The accessibility issue for which a fix is requested.
 * @returns {string} - The suggested fix for the issue, or a default message if the request fails.
 */
const getSuggestedFixes = async (issue) => {
    try {
        // Making a request to the OpenAI API to get a suggested fix for the issue
        const response = await openai.chat.completions.create({
            model: 'gpt-4', // Use the GPT-4 model for generating suggestions
            messages: [
                { role: 'system', content: 'You are an accessibility expert.' },
                { role: 'user', content: `Suggest a fix for this accessibility issue: ${issue}` }
            ]
        });
        
        // Return the suggested fix, trimming any extra whitespace
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error fetching suggestions from OpenAI:', error);
        // If there's an error, return a fallback message
        return 'No suggested fix available.';
    }
};

module.exports = getSuggestedFixes;
