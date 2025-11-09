import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, TrendingUp, Building2 } from 'lucide-react';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for real estate investments. I can help you with:\n\n• Property valuations\n• ROI and yield analyses\n• Location recommendations\n• Market trends\n• Risk assessment\n\nHow can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function fetchRecommendations() {
    try {
      const response = await fetch('/api/ai/recommendations?budget=500000');
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was a connection problem. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  }

  const quickQuestions = [
    'Which property has the best ROI?',
    'Which city should I invest in?',
    'What are the risks with high property prices?',
    'How do I calculate rental yield?',
  ];

  function handleQuickQuestion(question) {
    setInput(question);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Chat Area */}
      <div className="lg:col-span-2 flex flex-col card">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-600 to-accent-600 p-3 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Investment Assistant</h2>
              <p className="text-sm text-gray-400">Powered by Advanced AI</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-700">
          {/* Quick Questions */}
          <div className="mb-4 flex flex-wrap gap-2">
            {quickQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="input flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar - Recommendations */}
      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary-500" />
            <h3 className="text-lg font-bold">AI Recommendations</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Based on current market data and your investment strategy
          </p>
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recommendations available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.slice(0, 3).map((property) => (
                <div key={property.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm line-clamp-1">{property.city}</h4>
                    <div className="bg-green-900 text-green-400 text-xs px-2 py-0.5 rounded-full">
                      Score: {property.score}
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="text-white">€{Math.round(property.price / 1000)}k</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI:</span>
                      <span className="text-green-500">{property.roi?.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span className="text-white">{property.size}m²</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                    {property.reasoning}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-6 w-6 text-accent-500" />
            <h3 className="text-lg font-bold">Investment Tips</h3>
          </div>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              <span>Diversify your portfolio across different cities</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              <span>Look for a minimum ROI of 5%</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              <span>Consider long-term market trends</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              <span>Check infrastructure and transportation access</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
