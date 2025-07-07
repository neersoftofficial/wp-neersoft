import React, { useState, useEffect } from 'react';
import { Globe, Copy, ExternalLink, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const WebhookStatus: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Get current StackBlitz URL
    const currentUrl = window.location.origin;
    const fullWebhookUrl = `${currentUrl}/api/webhook/whatsapp`;
    setWebhookUrl(fullWebhookUrl);
    
    // Check if webhook is accessible
    checkWebhookStatus(fullWebhookUrl);
  }, []);

  const checkWebhookStatus = async (url: string) => {
    try {
      const response = await fetch(url.replace('/webhook', '/test-webhook'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      setIsOnline(response.ok);
    } catch {
      setIsOnline(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshStatus = () => {
    checkWebhookStatus(webhookUrl);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          StackBlitz Webhook Status
        </h3>
        <button
          onClick={handleRefreshStatus}
          className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
            {isOnline ? 'Webhook Online' : 'Webhook Offline'}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Webhook URL
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={webhookUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
            />
            <button
              onClick={handleCopyUrl}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verify Token
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value="9e04afae-6b6b-4aa4-a334-3acc20c48779"
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText('9e04afae-6b6b-4aa4-a334-3acc20c48779');
                alert('Verify token copied!');
              }}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">Configure in WhatsApp Business API:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline">Meta Developer Console</a></li>
                <li>Select your WhatsApp Business API app</li>
                <li>Navigate to WhatsApp → Configuration</li>
                <li>Set Callback URL to the webhook URL above</li>
                <li>Set Verify Token to the token above</li>
                <li>Subscribe to "messages" field</li>
                <li>Click "Verify and Save"</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <a
            href="https://developers.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Configure WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default WebhookStatus;