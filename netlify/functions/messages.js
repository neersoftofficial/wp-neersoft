const allowedOrigins = [
  'https://neersoft.netlify.app',
  'http://localhost:5173',
  'https://localhost:5173'
];

// This would be shared with webhook.js in a real app with a database
// For now, we'll use a simple in-memory store
let receivedMessages = [];

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // GET request - Retrieve messages
  if (event.httpMethod === 'GET') {
    console.log(`📤 Sending ${receivedMessages.length} messages to frontend`);
    
    // Optional: Add pagination
    const params = event.queryStringParameters || {};
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedMessages = receivedMessages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by newest first
      .slice(startIndex, endIndex);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        messages: paginatedMessages,
        total: receivedMessages.length,
        page: page,
        totalPages: Math.ceil(receivedMessages.length / limit),
        hasMore: endIndex < receivedMessages.length
      })
    };
  }

  // DELETE request - Clear messages (for testing)
  if (event.httpMethod === 'DELETE') {
    const count = receivedMessages.length;
    receivedMessages = [];
    console.log(`🗑️ Cleared ${count} messages`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Cleared ${count} messages`,
        remainingMessages: receivedMessages.length
      })
    };
  }

  // Method not allowed
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};