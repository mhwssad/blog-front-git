# WebSocket 前端集成 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：WebSocket 前端集成相关指南，包括重连策略、多标签页支持、消息发送流程、与 HTTP 接口配合、快速参考、枚举值说明等内容。

---

## 9. 前端集成建议

### 9.1 重连策略

```javascript
class ChatWebSocketManager {
  constructor() {
    this.socket = null;
    this.reconnectAttempt = 0;
    this.maxReconnectAttempts = 10;
    this.baseDelay = 1000;
    this.maxDelay = 30000;
    this.heartbeatInterval = null;
    this.lastPongTime = 0;
    this.token = null;
  }

  connect(token) {
    this.token = token;
    this.reconnectAttempt = 0;
    this.doConnect();
  }

  doConnect() {
    const wsUrl = `ws://localhost:8000/ws/chat?accessToken=${this.token}`;
    console.log(`Connecting to ${wsUrl}...`);

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempt = 0;
      this.startHeartbeat();
    };

    this.socket.onmessage = (event) => this.handleMessage(event);

    this.socket.onclose = (event) => {
      console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
      this.stopHeartbeat();
      this.scheduleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  handleMessage(event) {
    const data = JSON.parse(event.data);

    if (data.type === 'pong') {
      this.lastPongTime = Date.now();
      return;
    }

    // 处理其他消息...
  }

  scheduleReconnect() {
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      this.notifyUser('连接失败，请刷新页面');
      return;
    }

    // 指数退避，最大 30 秒
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempt),
      this.maxDelay
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt + 1}/${this.maxReconnectAttempts})`);
    this.reconnectAttempt++;

    setTimeout(() => this.doConnect(), delay);
  }

  startHeartbeat() {
    // 每 30 秒发送一次 ping
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        // 检查是否收到过 pong，超时则断开
        if (this.lastPongTime > 0 && Date.now() - this.lastPongTime > 60000) {
          console.warn('No pong received for 60s, closing connection');
          this.socket.close();
          return;
        }
        this.socket.send('ping');
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.lastPongTime = 0;
  }

  notifyUser(message) {
    // 可结合 UI 框架显示通知
    console.warn('Chat notification:', message);
  }

  disconnect() {
    this.reconnectAttempt = this.maxReconnectAttempts; // 阻止自动重连
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
    }
  }

  // 发送消息并等待 ack
  async sendMessage(conversationId, content, clientMessageId) {
    return this.send('send_message', {
      conversationId,
      content,
      clientMessageId
    });
  }

  // 通过目标用户 ID 发送单聊消息
  async sendMessageToUser(targetUserId, content, clientMessageId) {
    return this.send('send_message', {
      targetUserId,
      content,
      clientMessageId
    });
  }

  async markRead(conversationId, readMessageId) {
    return this.send('mark_read', {
      conversationId,
      readMessageId
    });
  }

  send(type, payload) {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const message = JSON.stringify({ type, requestId, payload });

      this.socket.send(message);

      // 简单超时处理，实际项目可配合 pendingRequests Map
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 10000);

      // 实际使用时应在 handleMessage 中根据 requestId 匹配响应
      // 这里简化处理，假设服务端会立即响应
      resolve({ requestId });
    });
  }
}
```

### 9.2 多标签页 / 多设备
- 每个标签页独自创建 WebSocket 连接
- 服务端通过 `read_updated` 事件回调各端的已读状态
- 建议在多标签页场景下，活跃标签页才建立长连接，非活跃标签页可断开以节省资源
- 多节点部署时，服务端通过 Redis Pub/Sub 在节点间推送共享事件

### 9.3 消息发送流程建议

1. 用户输入消息内容
2. 前端生成 `clientMessageId`（UUID 或时间戳 + 随机字符串）
3. 通过 WebSocket `send_message` 发送
4. 等待 `ack` 响应（匹配 `requestId`）
5. 收到 `ack` 后标记消息为"已发送"状态
6. 同时会收到自己触发的 `message_created`，可用于确认消息已广播到服务端

### 9.4 消息幂等

- 使用 `clientMessageId` 实现幂等发送
- 如未收到 `ack` 就断开连接，则重新发送相同 `clientMessageId` 的消息
- 服务端会拒绝重复的 `clientMessageId`

### 9.5 与 HTTP 接口配合

| 操作 | 推荐方式 | 说明 |
|------|---------|------|
| 发送文本消息 | WebSocket `send_message` | 实时性好 |
| 发送文件消息 | HTTP `POST /api/user/chat/messages/file` | WebSocket 不支持文件上传 |
| 获取历史消息 | HTTP `GET /api/user/chat/conversations/{id}/messages` | 分页加载 |
| 获取会话列表 | HTTP `GET /api/user/chat/conversations` | 初始加载 |
| 编辑消息 | HTTP `PUT /api/user/chat/messages/{id}` | 编辑后推送 `message_updated` |
| 撤回消息 | HTTP `POST /api/user/chat/messages/{id}/revoke` | 撤回后推送 `message_revoked` |
| 删除消息 | HTTP `DELETE /api/user/chat/messages/{id}` | 删除后推送 `message_deleted` |
| 标记已读 | WebSocket `mark_read` | 实时性好 |
| 实时接收新消息 | 监听 `message_created` | 不需要轮询 |
| 实时接收编辑/撤回 | 监听 `message_updated` / `message_revoked` | 不需要轮询 |

---

## 10. 快速参考

### 10.1 消息流向时序图

```
客户端                              服务端
  |                                   |
  |-------- connect(token) ---------->|
  |                                   |
  |<------- ready (sessionId) --------|
  |                                   |
  |-------- ping -------------------->|
  |<------- pong ---------------------|
  |                                   |
  |-------- send_message ------------>|
  |<------- ack ----------------------|
  |<------- message_created (广播) ---|
  |                                   |
  |-------- mark_read -------------->|
  |<------- ack ----------------------|
  |<------- read_updated (广播) ------|
  |                                   |
  |-------- disconnect -------------->|
  |                                   |
```

### 10.2 常用代码模板

#### 初始化连接

```javascript
const chatWs = new ChatWebSocket();
chatWs.connect(accessToken);
```

#### 发送消息（已有会话）

```javascript
try {
  const result = await chatWs.sendMessage(conversationId, content, clientMessageId);
  console.log('Message sent:', result);
} catch (error) {
  console.error('Send failed:', error);
}
```

#### 发送消息（通过目标用户 ID 自动创建/获取单聊）

```javascript
try {
  const result = await chatWs.sendMessageToUser(targetUserId, content, clientMessageId);
  console.log('Message sent:', result);
} catch (error) {
  console.error('Send failed:', error);
}
```

#### 标记已读

```javascript
try {
  await chatWs.markRead(conversationId, readMessageId);
} catch (error) {
  console.error('Mark read failed:', error);
}
```

#### 断开连接

```javascript
chatWs.disconnect();
```

---

## 附录：枚举值说明

### 会话类型 (conversationType)

| 值 | 说明 |
|----|------|
| `single` | 单聊 |
| `group` | 群聊 |
| `channel` | 频道 |

### 消息类型 (messageType)

| 值 | 说明 |
|----|------|
| `text` | 文本消息 |
| `image` | 图片消息 |
| `video` | 视频消息 |
| `audio` | 音频消息 |
| `file` | 文件消息 |

### 投递状态 (deliveryStatus)

| 值 | 说明 |
|----|------|
| 0 | 待投递 |
| 1 | 已送达 |
| 2 | 已读 |

### 成员角色 (role)

| 值 | 说明 |
|----|------|
| `owner` | 群主 |
| `admin` | 管理员 |
| `member` | 普通成员 |

### 转码状态 (transcodeStatus)

| 值 | 说明 |
|----|------|
| `source` | 原始文件 |
| `pending` | 转码排队中 |
| `ready` | 转码完成 |
| `failed` | 转码失败 |

### 回复消息状态 (state)

| 值 | 说明 |
|----|------|
| `normal` | 正常 |
| `revoked` | 已撤回 |
| `unavailable` | 不可用 |

### 变更动作 (action)

| 值 | 说明 |
|----|------|
| `joined` | 成员加入 |
| `left` | 成员退出 |
| `role_changed` | 角色变更 |
| `mute_changed` | 禁言状态变更 |
| `updated` | 会话信息更新 |
| `created` | 会话创建 |