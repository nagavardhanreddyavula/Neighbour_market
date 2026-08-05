import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')

        if message and sender_id and receiver_id:
            # Save message to database asynchronously
            saved_msg = await self.save_message(sender_id, receiver_id, message)

            # Broadcast message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'id': saved_msg['id'],
                    'message': message,
                    'sender_id': sender_id,
                    'receiver_id': receiver_id,
                    'sender_username': saved_msg['sender_username'],
                    'timestamp': saved_msg['timestamp']
                }
            )

    async def chat_message(self, event):
        # Send message to WebSocket client
        await self.send(text_data=json.dumps({
            'id': event['id'],
            'message': event['message'],
            'sender_id': event['sender_id'],
            'receiver_id': event['receiver_id'],
            'sender_username': event['sender_username'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, message):
        from .models import ChatMessage
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)
        msg_obj = ChatMessage.objects.create(
            sender=sender,
            receiver=receiver,
            message=message
        )
        return {
            'id': msg_obj.id,
            'sender_username': sender.username,
            'timestamp': msg_obj.timestamp.isoformat()
        }
