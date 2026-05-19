# WebSocket 通信协议 - 客户端请求

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

---

## 1. 连接地址

### 端点配置

| 配置项 | 值 |
|--------|-----|
| 默认端点 | `/ws/chat` |
| 认证参数名 | `accessToken` |
| 协议 | `ws://` (HTTP) 或 `wss://` (HTTPS) |

### 认证方式

握手阶段支持两种方式传递认证令牌（二选一）：

1. **请求参数**（推荐）：通过 URL 参数传递
2. **请求头**（可选）：通过 `Authorization` 请求头传递

### 连接地址格式

```
ws://{host}/ws/chat?accessToken={accessToken}
```

### 连接示例

```javascript
class ChatWebSocket {
  constructor() {
    this.socket = null;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.pendingRequests = new Map();
  }

  connect(token) {
    const wsUrl = `ws://localhost:8000/ws/chat?accessToken=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.startHeartbeat();
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected', event.code, event.reason);
      this.stopHeartbeat();
      this.scheduleReconnect(token);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  handleMessage(data) {
    // 处理 ack 响应，轮询等特中的请求
    if (data.type === 'ack' && data.requestId && this.pendingRequests.has(data.requestId)) {
      const { resolve, reject } = this.pendingRequests.get(data.requestId);
      this.pendingRequests.delete(data.requestId);
      if (data.code === 200) {
        resolve(data.payload);
      } else {
        reject(new Error(data.message));
      }
      return;
    }

    // 处理其他服务端推送
    switch (data.type) {
      case 'ready':
        console.log('Session ready:', data.payload);
        break;
      case 'message_created':
        console.log('New message:', data.payload);
        break;
      case 'message_updated':
        console.log('Message updated:', data.payload);
        break;
      case 'message_revoked':
        console.log('Message revoked:', data.payload);
        break;
      case 'message_deleted':
        console.log('Message deleted:', data.payload);
        break;
      case 'read_updated':
        console.log('Read status updated:', data.payload);
        break;
      case 'conversation_updated':
        console.log('Conversation updated:', data.payload);
        break;
      case 'members_updated':
        console.log('Members updated:', data.payload);
        break;
      case 'pong':
        // 心跳响应，无需处理
        break;
      case 'error':
        console.error('Server error:', data.code, data.message);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  send(type, payload) {
    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();
      const message = { type, requestId, payload };

      this.pendingRequests.set(requestId, { resolve, reject });

      // 设置超时
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 10000);

      this.socket.send(JSON.stringify(message));
    });
  }

  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  scheduleReconnect(token) {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    const delay = 3000;
    console.log(`Scheduling reconnect in ${delay}ms...`);
    this.reconnectTimer = setTimeout(() => {
      this.connect(token);
    }, delay);
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send('ping');
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
    }
  }
}

// 使用示例
const ws = new ChatWebSocket();
ws.connect('your-access-token');
```

---

## 2. 消息格式

### 2.1 客户端请求

```json
{
  "type": "send_message",
  "requestId": "1710000000000-abc123",
  "payload": {
    "conversationId": 1001,
    "content": "你好",
    "clientMessageId": "client-msg-001"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 消息类型，见 3.1 节 |
| requestId | string | 否 | 请求唯一标识，用于匹配响应 |
| payload | object | 否 | 请求业务载荷，结构由 type 定义 |

### 2.2 服务端响应

```json
{
  "type": "ack",
  "requestId": "1710000000000-abc123",
  "timestamp": "2024-03-09T12:00:00",
  "code": 200,
  "message": "成功",
  "payload": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 响应类型，见 3.2 节 |
| requestId | string | 关联的请求 ID（服务端推送时为 null） |
| timestamp | string | 服务器时间（ISO 8601） |
| code | integer | 状态码，200 表示成功 |
| message | string | 状态描述 |
| payload | object | 业务载荷 |

---

## 3. 消息类型总览

### 3.1 客户端可发送的类型

| type | 说明 | 备注 |
|------|------|------|
| `ping` | 心跳请求 | 可发送纯文本 "ping"，无需 JSON |
| `send_message` | 发送文本消息 | 需要 payload |
| `mark_read` | 标记已读会话 | 需要 payload |

### 3.2 服务端推送的类型

| type | 说明 | 方向 |
|------|------|------|
| `ready` | 连接建立成功 | 服务端 → 客户端 |
| `pong` | 心跳响应 | 服务端 → 客户端 |
| `ack` | 业务请求确认 | 服务端 → 客户端 |
| `message_created` | 新消息 | 服务端 → 客户端 |
| `message_updated` | 消息已编辑 | 服务端 → 客户端 |
| `message_revoked` | 消息已撤回 | 服务端 → 客户端 |
| `message_deleted` | 消息已删除 | 服务端 → 客户端 |
| `read_updated` | 已读状态推送 | 服务端 → 客户端 |
| `conversation_updated` | 会话信息变更 | 服务端 → 客户端 |
| `members_updated` | 群成员变更 | 服务端 → 客户端 |
| `error` | 错误响应 | 服务端 → 客户端 |

---

## 4. 连接就绪 (`ready`)

连接建立后，服务端立郎发送 ready 消息，前端应等待此消息后再开始业务操作。

### 响应格式

```json
{
  "type": "ready",
  "requestId": null,
  "timestamp": "2024-03-09T12:00:00",
  "code": 200,
  "message": "成功",
  "payload": {
    "sessionId": "abc123def456",
    "userId": 5,
    "username": "alice",
    "supportedRequestTypes": ["ping", "send_message", "mark_read"]
  }
}
```

| payload 字段 | 类型 | 说明 |
|-------------|------|------|
| sessionId | string | WebSocket 会话 ID |
| userId | long | 当前用户 ID |
| username | string | 当前用户名称 |
| supportedRequestTypes | array | 当前支持的请求类型 |

---

## 5. 心跳 (`ping` / `pong`)

### 5.1 纯文本 ping（推荐）

发送纯文本 `ping`，无需 JSON 格式：
```
ping
```

服务端响应（JSON 格式，requestId 为 null）：

```json
{
  "type": "pong",
  "requestId": null,
  "timestamp": "2024-03-09T12:00:00",
  "code": 200,
  "message": "成功",
  "payload": null
}
```

### 5.2 JSON ping

发送 JSON 格式 ping，可带 requestId：
```json
{
  "type": "ping",
  "requestId": "ping-001",
  "payload": null
}
```

服务端响应：

```json
{
  "type": "pong",
  "requestId": "ping-001",
  "timestamp": "2024-03-09T12:00:00",
  "code": 200,
  "message": "成功",
  "payload": null
}
```

### 5.3 心跳建议

- 推荐每 30 秒发送一次纯文本 `ping`
- 如 60 秒内未收到任何响应，应主动断开并重连
- 重连策略见第 9 节

---

## 6. 客户端请求详解

### 6.1 发送文本消息 (`send_message`)

#### 请求

```json
{
  "type": "send_message",
  "requestId": "msg-001",
  "payload": {
    "conversationId": 1001,
    "targetUserId": null,
    "content": "你好，这是测试消息",
    "clientMessageId": "client-msg-001",
    "replyMessageId": null
  }
}
```

| payload 字段 | 类型 | 必填 | 说明 |
|-------------|------|------|------|
| conversationId | long | 条件必填 | 会话 ID；已存在会话时优先传此字段 |
| targetUserId | long | 条件必填 | 单聊目标用户 ID；未传 conversationId 时用于自动创建或获取单聊 |
| content | string | 是 | 消息内容，最大 2000 字符 |
| clientMessageId | string | 否 | 客户端消息 ID，用于幂等校验，最大 64 字符 |
| replyMessageId | long | 否 | 回复的消息 ID |

> **注意**：`conversationId` 和 `targetUserId` 至少需要传一个，二者同时为空时服务端将返回参数错误。

#### 成功响应 (ack)

```json
{
  "type": "ack",
  "requestId": "msg-001",
  "timestamp": "2024-03-09T12:00:00",
  "code": 200,
  "message": "成功",
  "payload": {
    "requestType": "send_message",
    "data": {
      "id": 5002,
      "conversationId": 1001,
      "senderId": 5,
      "senderUsername": "alice",
      "senderNickname": "Alice",
      "senderAvatar": "https://example.com/avatar/5.png",
      "messageType": "text",
      "content": "你好，这是测试消息",
      "file": null,
      "replyMessageId": null,
      "reply": null,
      "clientMessageId": "client-msg-001",
      "self": true,
      "deliveryStatus": 1,
      "readByCurrentUser": true,
      "readAt": null,
      "revoked": false,
      "edited": false,
      "updatedAt": null,
      "createdAt": "2024-03-09T12:00:00"
    }
  }
}
```

#### 错误响应

```json
{
  "type": "error",
  "requestId": "msg-001",
  "timestamp": "2024-03-09T12:00:00",
  "code": 40011,
  "message": "send_message payload 不能为空",
  "payload": null
}
```

### 6.2 标记已读 (`mark_read`)

#### 请求

```json
{
  "type": "mark_read",
  "requestId": "read-001",
  "payload": {
    "conversationId": 1001,
    "readMessageId": 5000
  }
}
```

| payload 字段 | 类型 | 必填 | 说明 |
|-------------|------|------|------|
| conversationId | long | 是 | 会话 ID |
| readMessageId | long | 是 | 已读的消息 ID，之前的消息均视为已读 |

#### 成功响应 (ack)

```json
{
  "type": "ack",
  "requestId": "read-001",
  "timestamp": "2024-03-09T12:00:00",
  "code": 200,
  "message": "成功",
  "payload": {
    "requestType": "mark_read",
    "data": {
      "conversationId": 1001,
      "userId": 5,
      "readMessageId": 5000,
      "readAt": "2024-03-09T12:00:00",
      "deliveredMessageId": 5001,
      "deliveredAt": "2024-03-09T11:59:30",
      "unreadCount": 0
    }
  }
}
```

---
