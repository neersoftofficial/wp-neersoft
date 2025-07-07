const allowedOrigins = [
  'https://neersoft.netlify.app',
  'http://localhost:5173',
  'https://localhost:5173'
];

// In-memory storage for messages (in production, you'd use a database)
let receivedMessages = [];

// Your verify token - matches the one in your StackBlitz app
const VERIFY_TOKEN = '74b5c63b-81c9-40a0-a464-5d54922a2501';

export default function handler(req, res) {
  // Set CORS headers
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET request - Webhook verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    console.log('🔍 Webhook verification request:', { mode, token, challenge });
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Webhook verification failed - Invalid token');
      res.status(403).send('Forbidden');
    }
    return;
  }

  // POST request - Receive messages from WhatsApp
  if (req.method === 'POST') {
    console.log('📨 Webhook received from WhatsApp:', JSON.stringify(req.body, null, 2));
    
    try {
      const webhookData = req.body;
      
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
                  rawMessage: message // Store raw message for debugging
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

                // Store status update
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
      
      // Always respond with 200 to acknowledge receipt
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
}

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
  // In a real implementation, you would use the WhatsApp API to download media
  // For now, we'll return the media ID which can be used to fetch the actual file
  if (message.image?.id) return `media:${message.image.id}`;
  if (message.video?.id) return `media:${message.video.id}`;
  if (message.document?.id) return `media:${message.document.id}`;
  if (message.audio?.id) return `media:${message.audio.id}`;
  if (message.voice?.id) return `media:${message.voice.id}`;
  if (message.sticker?.id) return `media:${message.sticker.id}`;
  return undefined;
}