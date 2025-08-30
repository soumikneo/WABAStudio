import { WebSocketServer, WebSocket } from 'ws';
import type { IStorage } from '../storage';

interface Client {
  id: string;
  userId?: string;
  ws: WebSocket;
  rooms: Set<string>;
}

interface Message {
  type: string;
  data: any;
  room?: string;
  userId?: string;
}

export function setupWebSocket(wss: WebSocketServer, storage: IStorage) {
  const clients = new Map<string, Client>();

  wss.on('connection', (ws: WebSocket) => {
    const clientId = generateClientId();
    const client: Client = {
      id: clientId,
      ws,
      rooms: new Set(),
    };

    clients.set(clientId, client);
    console.log(`WebSocket client connected: ${clientId}`);

    ws.on('message', async (data) => {
      try {
        const message: Message = JSON.parse(data.toString());
        await handleMessage(client, message, storage, clients);
      } catch (error) {
        console.error('WebSocket message error:', error);
        sendToClient(client, {
          type: 'error',
          data: { message: 'Invalid message format' }
        });
      }
    });

    ws.on('close', () => {
      console.log(`WebSocket client disconnected: ${clientId}`);
      clients.delete(clientId);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(clientId);
    });

    // Send welcome message
    sendToClient(client, {
      type: 'connected',
      data: { clientId }
    });
  });

  // Broadcast functions for external use
  return {
    broadcast: (message: Message) => {
      broadcastToAll(clients, message);
    },
    broadcastToRoom: (room: string, message: Message) => {
      broadcastToRoom(clients, room, message);
    },
    sendToUser: (userId: string, message: Message) => {
      sendToUser(clients, userId, message);
    }
  };
}

async function handleMessage(
  client: Client, 
  message: Message, 
  storage: IStorage, 
  clients: Map<string, Client>
) {
  switch (message.type) {
    case 'auth':
      // Authenticate user and store userId
      client.userId = message.data.userId;
      
      // Join user-specific room
      const userRoom = `user:${message.data.userId}`;
      client.rooms.add(userRoom);
      
      sendToClient(client, {
        type: 'auth_success',
        data: { userId: client.userId }
      });
      
      // Notify others that user is online
      broadcastToAll(clients, {
        type: 'user_online',
        data: { userId: client.userId }
      });
      break;

    case 'join_room':
      // Join a specific room (e.g., template editing session)
      const room = message.data.room;
      client.rooms.add(room);
      
      sendToClient(client, {
        type: 'room_joined',
        data: { room }
      });
      
      // Notify others in the room
      broadcastToRoom(clients, room, {
        type: 'user_joined_room',
        data: { userId: client.userId, room }
      }, client.id);
      break;

    case 'leave_room':
      const leaveRoom = message.data.room;
      client.rooms.delete(leaveRoom);
      
      // Notify others in the room
      broadcastToRoom(clients, leaveRoom, {
        type: 'user_left_room',
        data: { userId: client.userId, room: leaveRoom }
      }, client.id);
      break;

    case 'template_editing':
      // Handle real-time template editing
      const templateRoom = `template:${message.data.templateId}`;
      
      broadcastToRoom(clients, templateRoom, {
        type: 'template_update',
        data: {
          templateId: message.data.templateId,
          changes: message.data.changes,
          userId: client.userId
        }
      }, client.id);
      break;

    case 'cursor_position':
      // Handle real-time cursor positions for collaborative editing
      const cursorRoom = `template:${message.data.templateId}`;
      
      broadcastToRoom(clients, cursorRoom, {
        type: 'cursor_update',
        data: {
          templateId: message.data.templateId,
          userId: client.userId,
          position: message.data.position
        }
      }, client.id);
      break;

    case 'template_validation_request':
      // Real-time template validation
      sendToClient(client, {
        type: 'validation_started',
        data: { templateId: message.data.templateId }
      });
      
      // This would trigger AI validation in the background
      // and send results back via WebSocket
      break;

    case 'compliance_alert':
      // Broadcast compliance alerts to all relevant users
      if (client.userId) {
        await storage.createComplianceEvent({
          wabaId: message.data.wabaId,
          templateId: message.data.templateId,
          eventType: 'user_reported_issue',
          status: message.data.severity || 'warning',
          severity: message.data.severity || 'medium',
          message: message.data.message,
          metadata: { reportedBy: client.userId }
        });

        // Broadcast to all users
        broadcastToAll(clients, {
          type: 'compliance_alert',
          data: message.data
        });
      }
      break;

    case 'team_activity':
      // Real-time team activity notifications
      if (client.userId) {
        await storage.createTeamActivity({
          userId: client.userId,
          activityType: message.data.activityType,
          resourceId: message.data.resourceId,
          resourceType: message.data.resourceType,
          description: message.data.description,
          metadata: message.data.metadata
        });

        // Broadcast to all users
        broadcastToAll(clients, {
          type: 'activity_update',
          data: message.data
        });
      }
      break;

    case 'ping':
      sendToClient(client, {
        type: 'pong',
        data: { timestamp: Date.now() }
      });
      break;

    default:
      sendToClient(client, {
        type: 'error',
        data: { message: `Unknown message type: ${message.type}` }
      });
  }
}

function sendToClient(client: Client, message: Message) {
  if (client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
  }
}

function broadcastToAll(clients: Map<string, Client>, message: Message, excludeClientId?: string) {
  clients.forEach((client, clientId) => {
    if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

function broadcastToRoom(
  clients: Map<string, Client>, 
  room: string, 
  message: Message, 
  excludeClientId?: string
) {
  clients.forEach((client, clientId) => {
    if (
      clientId !== excludeClientId && 
      client.rooms.has(room) && 
      client.ws.readyState === WebSocket.OPEN
    ) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

function sendToUser(clients: Map<string, Client>, userId: string, message: Message) {
  clients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

function generateClientId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
