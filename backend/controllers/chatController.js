const OpenAI = require('openai');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const mongoose = require('mongoose');

// Initialize OpenAI with user's API key
const getOpenAIClient = (apiKey) => {
  return new OpenAI({ apiKey });
};

// Helper to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Stream chat completion
const streamChat = async (req, res) => {
  try {
    const { conversationId, message, model } = req.body;
    // Use correct field name for API key
    const userApiKey = req.user.openApiKey;

    if (!userApiKey) {
      return res.status(400).json({ 
        error: 'Please set your OpenAI API key in settings' 
      });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      if (!isValidObjectId(conversationId)) {
        return res.status(400).json({ error: 'Invalid conversationId' });
      }
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId: req.user._id
      });
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      conversation = await Conversation.create({
        userId: req.user._id,
        model: model || req.user.preferences.model,
        title: message.substring(0, 50),
        archived: false
      });
    }

    // Save user message
    const userMessage = await Message.create({
      conversationId: conversation._id,
      role: 'user',
      content: message
    });

    // Get conversation history
    const messages = await Message.find({ 
      conversationId: conversation._id 
    }).sort({ createdAt: 1 }).limit(50);

    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Setup SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const openai = getOpenAIClient(userApiKey);
    let fullResponse = '';

    try {
      const stream = await openai.chat.completions.create({
        model: model || req.user.preferences.model,
        messages: formattedMessages,
        temperature: req.user.preferences.temperature,
        max_tokens: req.user.preferences.maxTokens,
        stream: true
      });

      res.write(`data: ${JSON.stringify({ 
        type: 'start', 
        conversationId: conversation._id 
      })}\n\n`);

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ 
            type: 'content', 
            content 
          })}\n\n`);
        }
      }

      // Save assistant message
      await Message.create({
        conversationId: conversation._id,
        role: 'assistant',
        content: fullResponse
      });

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();

    } catch (openaiError) {
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: openaiError.message 
      })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

const getConversations = async (req, res) => {
  try {
    // Use correct Mongoose sort method
    const conversations = await Conversation.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;
    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversationId' });
    }
    // Use correct query for conversation by _id
    const conversation = await Conversation.findOne({ _id: conversationId });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const message = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    res.status(200).json({ conversation, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteConversation = async (req, res) => {
  const conversationId = req.params.id;
  try {
    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversationId' });
    }
    const response = await Conversation.findOneAndDelete({ _id: conversationId, userId: req.user._id });
    if (!response) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    await Message.deleteMany({ conversationId: response._id });
    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  streamChat,
  getConversations,
  getMessages,
  deleteConversation
};