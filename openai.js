require('dotenv').config();
const { OpenAI } = require('openai');

// Initialize OpenAI with the API key from the environment variable
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get suggested fixes for a given accessibility issue using OpenAI.
 * 
 * This function sends a request to the OpenAI API to generate suggested fixes
 * for an accessibility issue based on a provided description.
 * The response is expected to provide a fix in plain text format.
 * 
 * @param {string} issue - The accessibility issue for which a fix is requested.
 * @returns {Promise<string>} - The suggested fix for the issue, or a default message if the request fails.
 */
const getSuggestedFixes = async (issue) => {
    // Validate input
    if (!issue || typeof issue !== 'string') {
        console.error('Invalid issue description provided.');
        return 'No suggested fix available.';
    }

    try {
        // Make a request to the OpenAI API to get a suggested fix for the issue
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are an accessibility expert.' },
                { role: 'user', content: `Suggest a fix for this accessibility issue: ${issue}` },
            ],
            max_tokens: 150, 
            temperature: 0.7,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error fetching suggestions from OpenAI:', error.message);
        return 'No suggested fix available.';
    }
};

module.exports = getSuggestedFixes;