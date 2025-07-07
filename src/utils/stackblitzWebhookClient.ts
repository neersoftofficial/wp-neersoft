// StackBlitz-optimized webhook client
export class StackBlitzWebhookClient {
  private static instance: StackBlitzWebhookClient;
  private webhookUrl: string;
  private messagesUrl: string;
  private pollInterval: number = 3000; // Poll every 3 seconds for StackBlitz
  private polling: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private messageHandlers: Array<(messages: any[]) => void> = [];
  private lastMessageCount: number = 0;

  constructor() {
    // Auto-detect StackBlitz environment
    const baseUrl = this.getStackBlitzUrl();
    this.webhookUrl = `${baseUrl}/api/webhook`;
    this.messagesUrl = `${baseUrl}/api/messages`;
  }

  static getInstance(): StackBlitzWebhookClient {
    if (!StackBlitzWebhookClient.instance) {
      StackBlitzWebhookClient.instance = new StackBlitzWebhookClient();
    }
    return StackBlitzWebhookClient.instance;
  }

  private getStackBlitzUrl(): string {
    // Auto-detect StackBlitz URL
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      
      if (hostname.includes('stackblitz.io')) {
        return `${protocol}//${hostname}`;
      }
      
      // For local development
      if (hostname === 'localhost') {
        return `${protocol}//${hostname}:${window.location.port}`;
      }
    }
    
    // Fallback
    return 'https://your-project.stackblitz.io';
  }

  startPolling(): void {
    if (this.polling) return;
    
    this.polling = true;
    console.log('🔄 Starting StackBlitz message polling from:', this.messagesUrl);
    
    this.intervalId = setInterval(async () => {
      try {
        const response = await fetch(this.messagesUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Only notify if there are new messages
          if (data.messages && data.messages.length > this.lastMessageCount) {
            console.log(`📨 New messages received: ${data.messages.length - this.lastMessageCount}`);
            this.messageHandlers.forEach(handler => handler(data.messages));
            this.lastMessageCount = data.messages.length;
          }
        } else {
          console.warn('⚠️ Failed to fetch messages:', response.status);
        }
      } catch (error) {
        console.error('❌ Error polling messages:', error);
      }
    }, this.pollInterval);
  }

  stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.polling = false;
    console.log('⏹️ Stopped StackBlitz message polling');
  }

  onMessage(handler: (messages: any[]) => void): void {
    this.messageHandlers.push(handler);
  }

  async testWebhook(): Promise<{ success: boolean; message: string }> {
    try {
      const testUrl = this.webhookUrl.replace('/webhook', '/test-webhook');
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: 'StackBlitz webhook test successful!' };
      } else {
        return { success: false, message: `Test failed: ${response.status}` };
      }
    } catch (error) {
      return { success: false, message: `Test error: ${error}` };
    }
  }

  async clearMessages(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(this.messagesUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.lastMessageCount = 0;
        return { success: true, message: data.message || 'Messages cleared successfully' };
      } else {
        return { success: false, message: `Clear failed: ${response.status}` };
      }
    } catch (error) {
      return { success: false, message: `Clear error: ${error}` };
    }
  }

  isPolling(): boolean {
    return this.polling;
  }

  getWebhookUrl(): string {
    return this.webhookUrl;
  }

  getFullWebhookUrl(): string {
    return this.webhookUrl;
  }
}