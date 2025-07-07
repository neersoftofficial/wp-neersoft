const allowedOrigins = [
  'https://neersoft.netlify.app',
  'http://localhost:5173',
  'https://localhost:5173'
];

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  if (event.httpMethod === 'POST') {
    console.log('🧪 Test webhook triggered');
    
    const testWebhookData = {
      object: 'whatsapp_business_account',
      entry: [{
        id: 'TEST_BUSINESS_ACCOUNT_ID',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '15550559999',
              phone_number_id: 'TEST_PHONE_NUMBER_ID'
            },
            contacts: [{
              profile: {
                name: 'Test User'
              },
              wa_id: '15551234567'
            }],
            messages: [{
              from: '15551234567',
              id: `test_${Date.now()}`,
              timestamp: Math.floor(Date.now() / 1000).toString(),
              text: {
                body: 'This is a test message from the Netlify webhook!'
              },
              type: 'text'
            }]
          },
          field: 'messages'
        }]
      }]
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Test webhook processed',
        testData: testWebhookData
      })
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};