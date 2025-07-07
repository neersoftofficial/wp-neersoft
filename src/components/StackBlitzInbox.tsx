import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Phone, User, Search, Filter, MoreVertical, Reply, Image, FileText, Mic, ExternalLink, Copy } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { IncomingMessage, Conversation, OutgoingMessage, Contact } from '../types';
import { WhatsAppAPI } from '../utils/whatsappApi';
import { StackBlitzWebhookClient } from '../utils/stackblitzWebhookClient';

const StackBlitzInbox: React.FC = () => {
  const { contacts, apiCredentials, setContacts } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<(IncomingMessage | OutgoingMessage)[]>([]);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const [isWebhookConnected, setIsWebhookConnected] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  // Initialize StackBlitz webhook client
  useEffect(() => {
    const webhookClient = StackBlitzWebhookClient.getInstance();
    
    // Start polling for messages
    webhookClient.startPolling();
    setIsWebhookConnected(true);
    setWebhookUrl(webhookClient.getFullWebhookUrl());
    
    // Listen for new messages
    webhookClient.onMessage((messages) => {
      console.log('📨 Processing messages from StackBlitz webhook:', messages);
      
      // Process each message
      messages.forEach(message => {
        if (message.type !== 'status_update') {
          // Find or create conversation
          setConversations(prev => {
            const existingConv = prev.find(c => c.contact.phoneNumber === message.from.replace(/^\+/, ''));
            
            if (existingConv) {
              // Update existing conversation
              return prev.map(conv => 
                conv.id === existingConv.id 
                  ? { 
                      ...conv, 
                      lastMessage: message, 
                      unreadCount: conv.unreadCount + 1,
                      updatedAt: new Date() 
                    }
                  : conv
              );
            } else {
              // Create new conversation with new contact
              const newContact: Contact = {
                id: crypto.randomUUID(),
                fullName: message.fromName || 'Unknown Contact',
                countryCode: '+' + message.from.substring(0, message.from.length - 10),
                phoneNumber: message.from.slice(-10),
                tags: ['new-contact'],
                customFields: {},
                createdAt: new Date(),
                updatedAt: new Date()
              };
              
              // Add to contacts list
              setContacts(prevContacts => [...prevContacts, newContact]);
              
              const newConversation: Conversation = {
                id: crypto.randomUUID(),
                contactId: newContact.id,
                contact: newContact,
                lastMessage: message,
                unreadCount: 1,
                updatedAt: new Date()
              };
              
              return [...prev, newConversation];
            }
          });
          
          // Add message to current conversation if it's selected
          if (selectedConversation) {
            const selectedConv = conversations.find(c => c.id === selectedConversation);
            if (selectedConv && selectedConv.contact.phoneNumber === message.from.replace(/^\+/, '')) {
              setMessages(prev => [...prev, message]);
            }
          }
        }
      });
    });
    
    return () => {
      webhookClient.stopPolling();
    };
  }, [selectedConversation, conversations, setContacts]);

  // Check connection status
  useEffect(() => {
    const webhookClient = StackBlitzWebhookClient.getInstance();
    const checkConnection = () => {
      setIsWebhookConnected(webhookClient.isPolling());
    };
    
    const connectionInterval = setInterval(checkConnection, 1000);
    
    return () => {
      clearInterval(connectionInterval);
    };
  }, []);

  const handleTestWebhook = async () => {
    const webhookClient = StackBlitzWebhookClient.getInstance();
    const result = await webhookClient.testWebhook();
    
    if (result.success) {
      alert('✅ StackBlitz webhook test successful! Check the inbox for a test message.');
    } else {
      alert(`❌ Webhook test failed: ${result.message}`);
    }
  };

  const handleClearMessages = async () => {
    if (!confirm('Are you sure you want to clear all messages?')) return;
    
    const webhookClient = StackBlitzWebhookClient.getInstance();
    const result = await webhookClient.clearMessages();
    
    if (result.success) {
      setConversations([]);
      setMessages([]);
      alert('✅ Messages cleared successfully!');
    } else {
      alert(`❌ Failed to clear messages: ${result.message}`);
    }
  };

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    alert('✅ Webhook URL copied to clipboard!');
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConv || !apiCredentials) return;

    setSending(true);
    try {
      const newMessage: OutgoingMessage = {
        id: crypto.randomUUID(),
        to: `${selectedConv.contact.countryCode}${selectedConv.contact.phoneNumber}`,
        messageType: 'text',
        content: replyText,
        timestamp: new Date(),
        status: 'SENT'
      };

      setMessages(prev => [...prev, newMessage]);
      setReplyText('');

      // Update conversation
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation 
          ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
          : conv
      ));
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'audio':
        return <Mic className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.contact.phoneNumber.includes(searchTerm)
  );

  // Mock messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const mockMessages: (IncomingMessage | OutgoingMessage)[] = [
        {
          id: 'msg-1',
          from: '+11234567890',
          fromName: 'John Doe',
          to: '+1987654321',
          messageType: 'text',
          content: 'Hi, I have a question about your service.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          isRead: true
        },
        {
          id: 'msg-2',
          to: '+11234567890',
          messageType: 'text',
          content: 'Hello! I\'d be happy to help. What would you like to know?',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          status: 'DELIVERED'
        },
        {
          id: 'msg-3',
          from: '+11234567890',
          fromName: 'John Doe',
          to: '+1987654321',
          messageType: 'text',
          content: 'I want to know about your pricing plans.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isRead: false
        }
      ];
      setMessages(mockMessages);
      markAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">StackBlitz Inbox</h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${isWebhookConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={isWebhookConnected ? 'text-green-600' : 'text-red-600'}>
              StackBlitz {isWebhookConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            {conversations.length} conversations
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 bg-red-500 rounded-full mr-1"></div>
            {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} unread
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleTestWebhook}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              Test
            </button>
            <button
              onClick={handleClearMessages}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No conversations found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Messages will appear here when customers contact you
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center flex-1">
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.contact.fullName}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {conversation.contact.countryCode} {conversation.contact.phoneNumber}
                          </p>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {'content' in conversation.lastMessage 
                              ? conversation.lastMessage.content 
                              : 'Template message'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {conversation.lastMessage.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedConv.contact.fullName}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedConv.contact.countryCode} {selectedConv.contact.phoneNumber}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${
                      'from' in message ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        'from' in message
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-green-600 text-white'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        {getMessageIcon(message.messageType)}
                        <span className="ml-1 text-xs opacity-75">
                          {message.messageType}
                        </span>
                      </div>
                      <p className="text-sm">{'content' in message ? message.content : 'Template message'}</p>
                      <p className={`text-xs mt-1 ${
                        'from' in message ? 'text-gray-500' : 'text-green-100'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                        {'status' in message && (
                          <span className="ml-2">
                            {message.status === 'DELIVERED' && '✓✓'}
                            {message.status === 'read' && '✓✓'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className={`h-4 w-4 ${sending ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Note: This sends a free-form text message (not a template)
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* StackBlitz Setup Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <MessageSquare className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-700 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium mb-2">StackBlitz Webhook Integration:</p>
                <p className={`text-sm ${isWebhookConnected ? 'text-green-700' : 'text-yellow-700'}`}>
                  {isWebhookConnected 
                    ? '✅ Ready to receive real WhatsApp messages' 
                    : '⚠️ Configure webhook in WhatsApp to receive real messages'
                  }
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopyWebhookUrl}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy URL
                </button>
                <a
                  href="https://developers.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Configure
                </a>
              </div>
            </div>
            <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded">
              <p className="text-xs font-medium text-green-800">
                🚀 Your StackBlitz Webhook URL:
              </p>
              <code className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded mt-1 block">
                {webhookUrl}
              </code>
              <p className="text-xs text-green-700 mt-1">
                Use this URL in your WhatsApp Business API webhook configuration
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackBlitzInbox;