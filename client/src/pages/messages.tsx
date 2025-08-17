import { useState } from "react";
import { Search, Send, Phone, Video, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
  avatar: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
}

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1");
  const [newMessage, setNewMessage] = useState("");

  const conversations: Conversation[] = [
    {
      id: "1",
      name: "Dr. Sarah Wilson",
      lastMessage: "The patient's test results came back positive...",
      time: "2 min ago",
      unread: 2,
      avatar: "SW",
      online: true,
    },
    {
      id: "2", 
      name: "Brooklyn Simmons",
      lastMessage: "Thank you for the consultation. I feel much better.",
      time: "1 hour ago",
      unread: 0,
      avatar: "BS",
      online: false,
    },
    {
      id: "3",
      name: "Dr. Michael Chen", 
      lastMessage: "Can we schedule a follow-up meeting?",
      time: "3 hours ago",
      unread: 1,
      avatar: "MC",
      online: true,
    },
    {
      id: "4",
      name: "Jenny Wilson",
      lastMessage: "I have some questions about my prescription.",
      time: "1 day ago", 
      unread: 0,
      avatar: "JW",
      online: false,
    },
  ];

  const messages: Message[] = [
    {
      id: "1",
      sender: "Dr. Sarah Wilson",
      content: "Good morning! I've reviewed the patient files you sent yesterday.",
      time: "10:30 AM",
      isOwn: false,
      avatar: "SW",
    },
    {
      id: "2",
      sender: "You",
      content: "Thanks Sarah. What are your thoughts on the treatment plan?",
      time: "10:32 AM", 
      isOwn: true,
      avatar: "RF",
    },
    {
      id: "3",
      sender: "Dr. Sarah Wilson",
      content: "The patient's test results came back positive. I think we should adjust the medication dosage.",
      time: "10:35 AM",
      isOwn: false,
      avatar: "SW",
    },
    {
      id: "4",
      sender: "You",
      content: "That sounds reasonable. Should we schedule a follow-up appointment?",
      time: "10:37 AM",
      isOwn: true,
      avatar: "RF",
    },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // TODO: Add message sending logic
      setNewMessage("");
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-100 text-red-600',
      'bg-blue-100 text-blue-600', 
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-yellow-100 text-yellow-600',
      'bg-indigo-100 text-indigo-600',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Messages</h1>
        <p className="text-text-secondary">Communicate with patients and colleagues</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
              <Input
                type="text"
                placeholder="Search conversations..."
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conversation.id ? 'bg-blue-50 border-r-2 border-r-medisight-teal' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(conversation.name)}`}>
                      <span className="font-semibold text-sm">{conversation.avatar}</span>
                    </div>
                    {conversation.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-text-primary truncate">{conversation.name}</h3>
                      <span className="text-xs text-text-secondary">{conversation.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-text-secondary truncate">{conversation.lastMessage}</p>
                      {conversation.unread > 0 && (
                        <div className="w-5 h-5 bg-medisight-teal rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">{conversation.unread}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor("Dr. Sarah Wilson")}`}>
                  <span className="font-semibold text-sm">SW</span>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Dr. Sarah Wilson</h3>
                  <p className="text-sm text-green-600">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.isOwn
                          ? 'bg-medisight-teal text-white'
                          : 'bg-gray-100 text-text-primary'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className={`text-xs text-text-secondary mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                      {message.time}
                    </p>
                  </div>
                  {!message.isOwn && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center order-0 mr-2 ${getAvatarColor(message.sender)} flex-shrink-0`}>
                      <span className="text-xs font-semibold">{message.avatar}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end space-x-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 min-h-0 resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-medisight-teal hover:bg-medisight-dark-teal"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-text-secondary">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}