import React, { useState, useEffect, useRef } from 'react';
import { Send, Key } from 'lucide-react';

const Input = ({ className, ...props }) => (
  <input
    className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none ${className}`}
    {...props}
  />
);

const Button = ({ className, ...props }) => (
  <button
    className={`px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline ${className}`}
    {...props}
  />
);

const Textarea = ({ className, ...props }) => (
  <textarea
    className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none ${className}`}
    {...props}
  />
);

const Card = ({ className, ...props }) => (
  <div
    className={`bg-white shadow-md rounded-lg ${className}`}
    {...props}
  />
);

const CardHeader = ({ className, ...props }) => (
  <div className={`px-6 py-4 border-b ${className}`} {...props} />
);

const CardTitle = ({ className, children, ...props }) => (
  <h3 className={`text-xl font-semibold text-gray-800 ${className}`} {...props}>
    {children}
  </h3>
);

const CardContent = ({ className, ...props }) => (
  <div className={`p-6 ${className}`} {...props} />
);

const CardFooter = ({ className, ...props }) => (
  <div className={`px-6 py-4 border-t ${className}`} {...props} />
);

const Alert = ({ className, ...props }) => (
  <div
    role="alert"
    className={`bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 ${className}`}
    {...props}
  />
);

const AlertTitle = ({ className, children, ...props }) => (
  <h5 className={`font-bold ${className}`} {...props}>{children}</h5>
);

const AlertDescription = ({ className, ...props }) => (
  <div className={`mt-2 ${className}`} {...props} />
);

const GeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Gemini');
      }

      const data = await response.json();
      setMessages([...newMessages, { text: data.reply, sender: 'ai' }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { text: "An error occurred. Please try again.", sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeySubmit = async () => {
    if (apiKey.trim() === '') return;

    try {
      const response = await fetch('http://localhost:3001/api/set-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to set API key');
      }

      setIsApiKeySet(true);
    } catch (error) {
      console.error('Error setting API key:', error);
      alert('Failed to set API key. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Chat with Gemini 1.5 Pro</CardTitle>
          </CardHeader>
          <CardContent>
            {!isApiKeySet ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTitle>API Key Required</AlertTitle>
                  <AlertDescription>
                    Please enter your Gemini 1.5 Pro API key to start chatting.
                  </AlertDescription>
                </Alert>
                <Input
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button onClick={handleKeySubmit}>Set API Key</Button>
              </div>
            ) : (
              <div className="h-96 overflow-auto mb-4 space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                      {message.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] p-3 rounded-lg bg-gray-200">
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
          {isApiKeySet && (
            <CardFooter>
              <div className="flex w-full space-x-2">
                <Textarea
                  placeholder="Type your message here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleSend} disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default GeminiChat;