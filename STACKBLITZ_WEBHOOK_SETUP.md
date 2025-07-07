# 🚀 StackBlitz WhatsApp Webhook Setup

## 📡 Your Webhook Details

**Your StackBlitz App URL**: 
```
https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3-v76qmf54--5173--96435430.local-credentialless.webcontainer-api.io
```

**Webhook URL for WhatsApp**: 
```
https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3-v76qmf54--5173--96435430.local-credentialless.webcontainer-api.io/api/webhook/whatsapp
```

**Verify Token**: 
```
74b5c63b-81c9-40a0-a464-5d54922a2501
```

## 🔧 Configure WhatsApp Business API

### Step 1: Go to Meta Developer Console
1. Visit: [developers.facebook.com](https://developers.facebook.com/)
2. Select your WhatsApp Business API app
3. Navigate to **WhatsApp** → **Configuration**

### Step 2: Set Webhook
1. **Callback URL**: 
   ```
   https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3-v76qmf54--5173--96435430.local-credentialless.webcontainer-api.io/api/webhook/whatsapp
   ```

2. **Verify Token**: 
   ```
   74b5c63b-81c9-40a0-a464-5d54922a2501
   ```

3. **Webhook Fields**: Check `messages`

4. Click **"Verify and Save"**

### Step 3: Test Your Setup
1. Go to your StackBlitz app: [Open App](https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3-v76qmf54--5173--96435430.local-credentialless.webcontainer-api.io)
2. Navigate to **Inbox** tab
3. Click **"Test"** button
4. Send a real message to your WhatsApp Business number
5. Check if messages appear in the inbox

## ✅ Quick Test Checklist

- [ ] Webhook URL configured in Meta Developer Console
- [ ] Verify token matches exactly
- [ ] Webhook fields include "messages"
- [ ] Webhook verification successful
- [ ] Test button works in Inbox tab
- [ ] Real WhatsApp message received

## 🎯 What Happens Next

Once configured:
1. **Real-time messages** appear in your inbox instantly
2. **New contacts** are automatically created
3. **Reply directly** from the interface
4. **Message status** tracking works
5. **Templates** can be sent to contacts

## 🔄 If URL Changes

If your StackBlitz URL changes, simply:
1. Update the webhook URL in Meta Developer Console
2. Use the new URL format: `https://new-url/api/webhook`
3. Keep the same verify token

## 📞 Support

- Check browser console for webhook logs
- Use the "Test" button to verify functionality
- Ensure your WhatsApp Business number is verified