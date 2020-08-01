import time
class Channel:
    def __init__(self, name):
        self.name = name
        self.messages = []
        self.time_of_creation = time.time()
        self.add_message(content=f"Welcome to {self.name}!", sender="admin")
    def add_message(self, content, sender):
        message = Message(content=content, channel=self.name, sender=sender)
        self.messages.append(message)

    
class Message:
    def __init__(self, content, channel, sender):
        self.content = content
        self.channel = channel
        self.sender = sender
        self.time_of_creation = time.time()