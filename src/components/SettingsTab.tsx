import React, { useState } from 'react';
import { Settings, Key, Save, AlertCircle, CheckCircle, ExternalLink, Palette, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { APICredentials } from '../types';
import AppCustomization from './AppCustomization';
import ContactGroups from './ContactGroups';
import WebhookSetup from './WebhookSetup';
import WebhookStatus from './WebhookStatus';
import WebhookTester from './WebhookTester';

const SettingsTab: React.FC = () => {
  const { apiCredentials, setApiCredentials } = useApp();
  const [activeSection, setActiveSection] = useState('api');
  const [formData, setFormData] = useState<APICredentials>({
    accessToken: apiCredentials?.accessToken || '',
    phoneNumberId: apiCredentials?.phoneNumberId || '',
    businessAccountId: apiCredentials?.businessAccountId || '',
  });
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  const sections = [
    { id: 'api', label: 'API Configuration', icon: Key },
    { id: 'webhook', label: 'Webhook Setup', icon: Settings },
    { id: 'customization', label: 'App Customization', icon: Palette },
    { id: 'groups', label: 'Contact Groups', icon: Users },
  ];

  const handleSave = () => {
    if (!formData.accessToken || !formData.phoneNumberId || !formData.businessAccountId) {
      setSaveStatus({ success: false, message: 'Please fill in all required fields' });
      return;
    }

    setApiCredentials(formData);
    setSaveStatus({ success: true, message: 'API credentials saved successfully' });
    
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleInputChange = (field: keyof APICredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'api':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Key className="h-5 w-5 text-gray-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">WhatsApp API Configuration</h3>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-2">How to get your WhatsApp API credentials:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Go to the <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Facebook Developers Portal</a></li>
                    <li>Create or select your app</li>
                    <li>Add the WhatsApp Business API product</li>
                    <li>Get your Access Token from the API settings</li>
                    <li>Find your Phone Number ID and Business Account ID</li>
                  </ol>
                  <p className="mt-2">
                    <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center">
                      View detailed setup guide
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-2">🔧 Troubleshooting 401 Errors:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Make sure your Access Token is not expired (they typically last 60 days)</li>
                    <li>Verify your app has been approved for WhatsApp Business API</li>
                    <li>Check that your token has these permissions: whatsapp_business_messaging, whatsapp_business_management</li>
                    <li>Ensure your Business Account ID matches the one in your Meta Business Manager</li>
                  </ul>
                  <p className="mt-2 text-xs">
                    💡 Test your credentials using the "Fetch Templates" button in the Templates tab
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.accessToken}
                  onChange={(e) => handleInputChange('accessToken', e.target.value)}
                  placeholder="Enter your WhatsApp API access token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Long-lived access token for your WhatsApp Business API app
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phoneNumberId}
                  onChange={(e) => handleInputChange('phoneNumberId', e.target.value)}
                  placeholder="Enter your phone number ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The ID of the phone number you'll use to send messages
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Account ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessAccountId}
                  onChange={(e) => handleInputChange('businessAccountId', e.target.value)}
                  placeholder="Enter your business account ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your WhatsApp Business Account ID for template management
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </button>
            </div>

            {saveStatus && (
              <div className={`mt-4 p-4 rounded-lg ${saveStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex">
                  {saveStatus.success ? (
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  )}
                  <p className={`text-sm ${saveStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                    {saveStatus.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      case 'customization':
        return <AppCustomization />;
      case 'webhook':
        return (
          <div className="space-y-6">
            <WebhookStatus />
            <WebhookSetup />
            <WebhookTester />
          </div>
        );
      case 'groups':
        return <ContactGroups />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeSection === section.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {section.label}
            </button>
          );
        })}
      </div>

      {renderActiveSection()}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Settings className="h-5 w-5 text-gray-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Application Information</h3>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Data Storage:</strong> All data is stored locally in your browser</p>
          <p><strong>Security:</strong> API credentials are encrypted in local storage</p>
          <p><strong>Rate Limits:</strong> Respect WhatsApp's messaging limits to avoid account suspension</p>
          <p><strong>Compliance:</strong> Ensure your messages comply with WhatsApp Business Policy</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;