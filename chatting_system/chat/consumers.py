from channels.generic.websocket import AsyncWebsocketConsumer

import json

class ChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.room_group_name= 'Test_room'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        self.receiver_channel_name = self.channel_name

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(

            self.room_group_name,
            self.channel_name
        )
        print('Disconnected')
    async def receive(self, text_data):

        receive_dict= json.loads(text_data)

        receive_dict['message']['receiver_channel_name'] = self.channel_name

        message= receive_dict['message']
        action= receive_dict['action']

        if (action == 'new-offer') or (action == 'new-answer'):
            reciver_channel_name = receive_dict['message']['receiver_channel_name']

            receive_dict['message']['receiver_channel_name'] = self.channel_name

            await self.channel_layer.send(
                self.receiver_channel_name,
                {
                    'type': 'send.sdp',
                    'receiver_dict': receive_dict
                }
            )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send.sdp',
                'receive_dict': receive_dict,
            }
        )

    async def send_sdp(self, event):
        receive_dict= event.get('receive_dict')

        await self.send(text_data=json.dumps(receive_dict))