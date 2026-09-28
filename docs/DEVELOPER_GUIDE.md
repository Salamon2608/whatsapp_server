# WhatsApp Server — Developer Integration Guide

A complete guide for software engineers and backend developers integrating with the **WHATSAPP SERVER Gateway**.

---

## 📌 1. Architecture Overview

WHATSAPP SERVER provides a high-performance RESTful API powered by the Baileys engine for WhatsApp Web automation. Any external application (Node.js, Python, PHP, Go, Java, C#, Ruby, etc.) can send and receive WhatsApp messages via standard HTTP/JSON requests.

```
┌───────────────────────────────────────┐
│     Your Application / Backend        │
│  (Node.js / Python / PHP / Laravel)   │
└──────────────────┬────────────────────┘
                   │
                   │  1. Outbound API Calls (HTTPS / JSON)
                   │     Headers: X-API-Key: wag_xxxx
                   ▼
┌───────────────────────────────────────┐
│           WHATSAPP SERVER             │
│   (Next.js REST API + Baileys Engine) │
└──────────────────┬────────────────────┘
                   │
                   │  2. Inbound Webhooks (HTTP POST)
                   │     Event: "message.received"
                   ▼
┌───────────────────────────────────────┐
│       Your Webhook Listener / Bot     │
│       /api/whatsapp/webhook           │
└───────────────────────────────────────┘
```

---

## 🔑 2. Authentication & Prerequisites

To make API calls to the server, you need three pieces of information from the server administrator or dashboard:

1. **`BASE_URL`**: The domain or IP of the WhatsApp Server (e.g., `https://wa.yourdomain.com` or `http://localhost:3000`).
2. **`API_KEY`**: A unique secret key for authentication (starts with `wag_...`).
3. **`SESSION_ID`**: The identifier of the connected WhatsApp instance (e.g., `primary`, `sales-bot`, `pondykings`).

### Header Specification
Every request must include your API Key:
```http
X-API-Key: wag_your_api_key_here
Content-Type: application/json
```

---

## 📱 3. Phone Number Format (JID)

WhatsApp uses **JID (Jabber ID)** format for addressing chats:
* **Individual Numbers**: `{country_code}{phone_number}@s.whatsapp.net`
  * Example for India (`+91 90927 25689`): `919092725689@s.whatsapp.net` or simply raw digits `919092725689`.
  * *Note: The server automatically normalizes raw numbers to `@s.whatsapp.net`.*
* **Group Chats**: `{group_id}@g.us`
  * Example: `120363025489721345@g.us`.

---

## 📤 4. Outbound Messaging Endpoints

### 4.1 Send Text Message
* **Method**: `POST`
* **Path**: `/api/messages/:sessionId/:jid/send`
* **Request Body**:
```json
{
  "message": "Hello from Pondy Kings Boating! Your booking #PKB-2026-001 is confirmed. 🚤"
}
```
* **Success Response (200 OK)**:
```json
{
  "status": true,
  "message": "Message sent successfully",
  "data": {
    "key": {
      "remoteJid": "919092725689@s.whatsapp.net",
      "fromMe": true,
      "id": "BAE59F82A1B2C3"
    },
    "message": {
      "conversation": "Hello from Pondy Kings Boating!..."
    },
    "messageTimestamp": 1720000000
  }
}
```

---

### 4.2 Send Media (PDF Ticket, Image, Document, Video, Audio)
* **Method**: `POST`
* **Path**: `/api/messages/:sessionId/:jid/media`
* **Request Body**:
```json
{
  "type": "document",
  "url": "https://yourdomain.com/tickets/ticket_PKB-101.pdf",
  "fileName": "Boat_Ride_Ticket.pdf",
  "caption": "Here is your confirmed booking ticket and QR boarding pass 🎟️"
}
```
Supported `type` values:
* `"image"` (JPEG, PNG, WebP)
* `"document"` (PDF, DOCX, XLSX, etc.)
* `"video"` (MP4)
* `"audio"` (MP3, OGG, PTT voice note)

---

### 4.3 Send Location
* **Method**: `POST`
* **Path**: `/api/messages/:sessionId/:jid/location`
* **Request Body**:
```json
{
  "latitude": 11.9139,
  "longitude": 79.8145,
  "name": "Pondy Kings Boating",
  "address": "Arikkamedu / Chunnambar River Mouth, Puducherry"
}
```

---

### 4.4 Check if Number Exists on WhatsApp
Before sending transactional alerts, verify if the customer has an active WhatsApp account:
* **Method**: `GET`
* **Path**: `/api/chat/:sessionId/check?phone=919092725689`
* **Response**:
```json
{
  "status": true,
  "exists": true,
  "jid": "919092725689@s.whatsapp.net"
}
```

---

## 📥 5. Inbound Webhooks (Receiving Messages & Building Chatbots)

The WhatsApp Server can notify your backend whenever a user sends a message, when connection states change, or when message delivery receipts arrive.

### 5.1 Registering Your Webhook
In the WhatsApp Server dashboard:
1. Navigate to **Sessions** ➔ Select your session.
2. Go to **Webhooks** ➔ Click **Add Webhook**.
3. **Webhook URL**: `https://api.yourdomain.com/api/whatsapp/webhook`
4. **Events**: Check `message.received` (or `*` for all events).
5. **Secret** *(optional)*: A shared secret for signature verification.

### 5.2 Webhook Payload Structure
When a user sends `"Hi"`, the WhatsApp Server sends a `POST` request to your webhook URL with the following JSON:

```json
{
  "event": "message.received",
  "sessionId": "pondykings",
  "timestamp": "2026-09-24T05:45:00.000Z",
  "data": {
    "key": {
      "id": "BAE53F91A2B3C4D5",
      "remoteJid": "919092725689@s.whatsapp.net",
      "fromMe": false
    },
    "pushName": "John Doe",
    "from": "919092725689@s.whatsapp.net",
    "sender": "919092725689@s.whatsapp.net",
    "isGroup": false,
    "chatType": "PERSONAL",
    "type": "TEXT",
    "content": "Hi",
    "caption": "",
    "fileUrl": null,
    "quoted": null
  }
}
```

### 5.3 Webhook Handling Checklist
1. **Always read `data.content`** (not `data.message`) for the message text.
2. **Check `data.key.fromMe`**: If `true`, ignore the message to prevent infinite echo loops.
3. **Normalize Phone**: Strip `@s.whatsapp.net` or non-digit characters (`data.from.replace(/\D/g, '')`).
4. **Respond with HTTP 200**: Always return `200 OK` promptly (within 3 seconds) to prevent retries.

---

## 🔐 6. Webhook Signature Verification (HMAC SHA-256)

If you configured a secret for your webhook, the WhatsApp Server sends an HMAC signature in the request headers:
* Header: `x-webhook-signature` or `x-signature`

Verify it in Node.js:
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(req, secret) {
  const signature = req.headers['x-webhook-signature'] || req.headers['x-signature'];
  if (!signature) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

## 💻 7. Code Examples in Multiple Languages

### Node.js (Fetch)
```javascript
const BASE_URL = process.env.WHATSAPP_SERVER_URL || 'https://wa.yourdomain.com';
const API_KEY = process.env.WHATSAPP_API_KEY || 'wag_your_key_here';
const SESSION_ID = process.env.WHATSAPP_SESSION_ID || 'primary';

async function sendWhatsAppText(phone, message) {
  const cleanPhone = phone.replace(/\D/g, '');

  const response = await fetch(`${BASE_URL}/api/messages/${SESSION_ID}/${cleanPhone}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ message })
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || 'Failed to send WhatsApp message');
  }
  return data;
}

// Example:
sendWhatsAppText('919092725689', 'Your booking is confirmed! 🚢')
  .then(res => console.log('Sent:', res))
  .catch(err => console.error('Error:', err.message));
```

---

### Python (requests)
```python
import requests
import os

BASE_URL = os.getenv("WHATSAPP_SERVER_URL", "https://wa.yourdomain.com")
API_KEY = os.getenv("WHATSAPP_API_KEY", "wag_your_key_here")
SESSION_ID = os.getenv("WHATSAPP_SESSION_ID", "primary")

def send_whatsapp_message(phone: str, text: str) -> dict:
    clean_phone = "".join(filter(str.isdigit, phone))
    url = f"{BASE_URL}/api/messages/{SESSION_ID}/{clean_phone}/send"
    
    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {"message": text}
    
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    response.raise_for_status()
    return response.json()

# Example:
result = send_whatsapp_message("919092725689", "Hello from Python!")
print(result)
```

---

### PHP (cURL / Laravel)
```php
<?php

function sendWhatsAppMessage($phone, $message) {
    $baseUrl   = getenv('WHATSAPP_SERVER_URL') ?: 'https://wa.yourdomain.com';
    $apiKey    = getenv('WHATSAPP_API_KEY') ?: 'wag_your_key_here';
    $sessionId = getenv('WHATSAPP_SESSION_ID') ?: 'primary';
    
    $cleanPhone = preg_replace('/\D/', '', $phone);
    $url = "{$baseUrl}/api/messages/{$sessionId}/{$cleanPhone}/send";

    $payload = json_encode(['message' => $message]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "X-API-Key: {$apiKey}",
        "Content-Type: application/json"
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return json_decode($response, true);
}

// Example:
$res = sendWhatsAppMessage("919092725689", "Your ticket has been booked successfully!");
print_r($res);
?>
```

---

### cURL (CLI)
```bash
curl -X POST "https://wa.yourdomain.com/api/messages/primary/919092725689/send" \
  -H "X-API-Key: wag_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from cURL command line!"}'
```

---

## ⚠️ 8. HTTP Status Codes & Error Handling

| Status Code | Meaning | Common Cause & Resolution |
| :--- | :--- | :--- |
| **`200 OK`** | Success | `{ "status": true, "message": "Message sent successfully" }` |
| **`400 Bad Request`** | Invalid Parameters | Message text is empty or parameter missing. Check JSON body. |
| **`401 Unauthorized`** | Invalid API Key | Header `X-API-Key` is missing or invalid. Check your API key. |
| **`403 Forbidden`** | Session Access Denied | Your user account does not have permission to access `:sessionId`. |
| **`404 Not Found`** | Session / Resource Not Found | The `:sessionId` does not exist in the database. |
| **`500 Server Error`** | Session Not Connected | WhatsApp instance is disconnected or phone is offline. Reconnect or re-scan QR. |

---

## 🧪 9. Interactive API Testing (Swagger UI)

Developers can test all 85+ endpoints directly in their web browser:
1. Open **`https://wa.yourdomain.com/swagger`**
2. Enter the documentation credentials (Default: `admin` / `admin123`)
3. Click on any endpoint (e.g. `POST /messages/{sessionId}/{jid}/send`)
4. Click **Try it out**, fill in parameters, and click **Execute** to see real HTTP requests and responses.
