const allowedOrigins = [
  'https://neersoft.netlify.app',
  'http://localhost:5173',
  'https://localhost:5173'
];

// In-memory storage for messages (in production, you'd use a database)
let receivedMessages = [];

// Your verify token - matches what you have in Meta Developer Console
const VERIFY_TOKEN = '9820247-e6da-49fc-858e-b0584ecdf608';

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

  // GET request - Webhook verification
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {};
    const mode = params['hub.mode'];
    const token = params['hub.verify_token'];
    const challenge = params['hub.challenge'];
    
    console.log('🔍 Webhook verification request:', { mode, token, challenge });
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully');
      return {
        statusCode: 200,
        headers,
        body: challenge
      };
    } else {
      console.log('❌ Webhook verification failed - Invalid token');
      return {
        statusCode: 403,
        headers,
        body: 'Forbidden'
      };
    }
  }

  // POST request - Receive messages from WhatsApp
  if (event.httpMethod === 'POST') {
    console.log('📨 Webhook received from WhatsApp:', event.body);
    
    try {
      const webhookData = JSON.parse(event.body);
      
      // Validate webhook data
      if (webhookData.object === 'whatsapp_business_account') {
        // Process each entry in the webhook
        webhookData.entry?.forEach(entry => {
          entry.changes?.forEach(change => {
            if (change.field === 'messages') {
              // Process incoming messages
              change.value.messages?.forEach(message => {
                const contact = change.value.contacts?.find(c => c.wa_id === message.from);
                
                const processedMessage = {
                  id: message.id,
                  from: message.from,
                  fromName: contact?.profile?.name || 'Unknown',
                  to: change.value.metadata.phone_number_id,
                  messageType: message.type,
                  content: extractMessageContent(message),
                  mediaUrl: extractMediaUrl(message),
                  timestamp: new Date(parseInt(message.timestamp) * 1000),
                  isRead: false,
                  webhookReceived: new Date(),
                  rawMessage: message
                };

                // Store the message
                receivedMessages.push(processedMessage);
                console.log('💾 Message stored:', processedMessage.id);
              });

              // Process message status updates
              change.value.statuses?.forEach(status => {
                const statusUpdate = {
                  id: `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  type: 'status_update',
                  messageId: status.id,
                  status: status.status,
                  timestamp: new Date(parseInt(status.timestamp) * 1000),
                  recipientId: status.recipient_id,
                  webhookReceived: new Date()
                };

                receivedMessages.push(statusUpdate);
                console.log('📊 Status update stored:', statusUpdate.messageId, status.status);
              });
            }
          });
        });
        
        console.log('✅ Webhook processed successfully');
      } else {
        console.log('⚠️ Invalid webhook object type:', webhookData.object);
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }

  // Method not allowed
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

// Utility function to extract message content based on type
function extractMessageContent(message) {
  switch (message.type) {
    case 'text':
      return message.text?.body || '';
    case 'image':
      return 'Image message';
    case 'video':
      return 'Video message';
    case 'document':
      return `Document: ${message.document?.filename || 'Unknown file'}`;
    case 'audio':
      return 'Audio message';
    case 'voice':
      return 'Voice message';
    case 'sticker':
      return 'Sticker message';
    case 'location':
      return 'Location message';
    case 'contacts':
      return 'Contact message';
    default:
      return `Unsupported message type: ${message.type}`;
  }
}

// Utility function to extract media URL/ID
function extractMediaUrl(message) {
  if (message.image?.id) return `media:${message.image.id}`;
  if (message.video?.id) return `media:${message.video.id}`;
  if (message.document?.id) return `media:${message.document.id}`;
  if (message.audio?.id) return `media:${message.audio.id}`;
  if (message.voice?.id) return `media:${message.voice.id}`;
  if (message.sticker?.id) return `media:${message.sticker.id}`;
  return undefined;
}