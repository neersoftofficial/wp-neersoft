import React, { useState } from 'react';
import { Globe, Key, CheckCircle, AlertCircle, Copy, ExternalLink, Server } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const WebhookSetup: React.FC = () => {
  const { apiCredentials, setApiCredentials } = useApp();
  const [webhookUrl, setWebhookUrl] = useState('https://neersoft.netlify.app/.netlify/functions/webhook');
  const [verifyToken, setVerifyToken] = useState('9820247-e6da-49fc-858e-b0584ecdf608');
  const [copied, setCopied] = useState(false);

  const testWebhookUrl = () => {
    const testUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test123`;
    window.open(testUrl, '_blank');
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(verifyToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveWebhookConfig = () => {
    if (apiCredentials) {
      setApiCredentials({
        ...apiCredentials,
        webhookVerifyToken: verifyToken
      });
    }
  };

  const generateNewToken = () => {
    setVerifyToken(crypto.randomUUID());
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Server className="h-5 w-5 text-gray-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Webhook Configuration</h3>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">Setting up WhatsApp Webhooks:</p>
              <p>Webhooks allow your application to receive real-time messages from WhatsApp users. You'll need a publicly accessible server endpoint to receive these webhooks.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-server.com/webhook/whatsapp"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your publicly accessible webhook endpoint URL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verify Token
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                readOnly
              />
              <button
                onClick={handleCopyToken}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                onClick={generateNewToken}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate New
              </button>
            </div>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={testWebhookUrl}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
              >
                Test Webhook URL
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use this token to verify your webhook with WhatsApp
            </p>
          </div>

          <button
            onClick={handleSaveWebhookConfig}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Webhook Configuration
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Setup Instructions</h4>
        
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h5 className="font-medium text-gray-900 mb-2">Step 1: Create Webhook Endpoint</h5>
            <p className="text-sm text-gray-600 mb-2">
              Create a server endpoint that can receive POST requests from WhatsApp. Here's a sample Node.js/Express implementation:
            </p>
            <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
              <pre>{`app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === '${verifyToken}') {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook/whatsapp', (req, res) => {
  // Process incoming messages
  console.log('Webhook received:', req.body);
  // Forward to your frontend application
  res.sendStatus(200);
});`}</pre>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h5 className="font-medium text-gray-900 mb-2">Step 2: Configure in Meta Developer Console</h5>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Go to your <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Meta Developer Console</a></li>
              <li>Select your WhatsApp Business API app</li>
              <li>Navigate to WhatsApp → Configuration</li>
              <li>Add your webhook URL: <code className="bg-gray-100 px-1 rounded">{webhookUrl || 'https://your-server.com/webhook/whatsapp'}</code></li>
              <li>Use verify token: <code className="bg-gray-100 px-1 rounded">{verifyToken}</code></li>
              <li>Subscribe to webhook fields: <code className="bg-gray-100 px-1 rounded">messages</code></li>
            </ol>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h5 className="font-medium text-gray-900 mb-2">Step 3: Test Your Webhook</h5>
            <p className="text-sm text-gray-600 mb-2">
              Send a test message to your WhatsApp Business number to verify the webhook is working.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs text-yellow-800">
                💡 <strong>Tip:</strong> Use tools like ngrok for local development to expose your local server to the internet.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Sample Webhook Payload</h4>
        <p className="text-sm text-gray-600 mb-3">
          This is what WhatsApp will send to your webhook when someone messages your business:
        </p>
        <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
          <pre>{`{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15550559999",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "contacts": [{
          "profile": {
            "name": "John Doe"
          },
          "wa_id": "15551234567"
        }],
        "messages": [{
          "from": "15551234567",
          "id": "wamid.xxx",
          "timestamp": "1699564800",
          "text": {
            "body": "Hello, I have a question!"
          },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}`}</pre>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-md font-semibold text-green-900 mb-2">🚀 Webhook Server Setup</h4>
        <div className="text-sm text-green-700 space-y-2">
          <p><strong>1. Deploy the webhook server:</strong></p>
          <div className="bg-green-100 p-2 rounded font-mono text-xs">
            cd server && npm install && npm start
          </div>
          <p><strong>2. Configure your domain:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Point your domain to your server IP</li>
            <li>Set up SSL certificate (required for WhatsApp)</li>
            <li>Update webhook URL to: <code className="bg-green-100 px-1 rounded">https://your-server.com/webhook/whatsapp</code></li>
          </ul>
          <p><strong>3. Test the connection:</strong></p>
          <div className="bg-green-100 p-2 rounded font-mono text-xs">
            curl -X POST https://your-server.com/test/webhook
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookSetup;