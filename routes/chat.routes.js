const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const {
  processChatMessage,
  getChatbotMenu,
  calculateCrCl,
  evaluateNaranjo,
  generateSoapTemplate
} = require('../services/chatbot.service');

// Optional auth resolver (does not reject unauthenticated or demo users)
const resolveUserOptional = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pharmd_mentor_clinical_jwt_secret_key_2026_super_secure');
        req.user = await User.findById(decoded.id).select('-password');
      }
    } catch (e) {
      // Non-blocking: continue as guest or demo
    }
  }
  next();
};

/**
 * @route   GET /api/chat/menu
 * @desc    Get structured chatbot menu, clinical categories, quick prompts & tools
 * @access  Public
 */
router.get('/menu', (req, res) => {
  try {
    const menuData = getChatbotMenu();
    res.json({ success: true, menu: menuData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/chat/message
 * @desc    Send a message to PharmD Mentor AI and receive a structured clinical response
 * @access  Public / Optional Auth
 */
router.post('/message', resolveUserOptional, async (req, res) => {
  try {
    const { message, conversationId, category = 'general', language = 'en', history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const convId = conversationId || `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const userId = req.user?._id || req.body.userId || null;
    const userRole = req.user?.role || req.body.userRole || 'STUDENT';

    // 1. Save user message to database if available
    let savedUserMsg = null;
    try {
      savedUserMsg = await ChatMessage.create({
        conversationId: convId,
        userId: userId ? String(userId) : null,
        userRole,
        role: 'user',
        content: message.trim(),
        category,
        language
      });
    } catch (dbErr) {
      console.warn('[Chat DB Save Notice (User Message)]:', dbErr.message);
    }

    // 2. Process clinical reasoning through AI Engine / Gemini
    const result = await processChatMessage({
      message: message.trim(),
      conversationId: convId,
      category,
      language,
      history
    });

    // 3. Save assistant reply to database if available
    let savedAssistantMsg = null;
    try {
      savedAssistantMsg = await ChatMessage.create({
        conversationId: convId,
        userId: userId ? String(userId) : null,
        userRole,
        role: 'assistant',
        content: result.content,
        category: result.category || category,
        language,
        metadata: {
          modelUsed: result.modelUsed,
          suggestions: result.suggestions
        }
      });
    } catch (dbErr) {
      console.warn('[Chat DB Save Notice (Assistant Message)]:', dbErr.message);
    }

    res.json({
      success: true,
      conversationId: convId,
      reply: {
        role: 'assistant',
        content: result.content,
        modelUsed: result.modelUsed,
        category: result.category || category,
        suggestions: result.suggestions || [],
        createdAt: new Date().toISOString()
      },
      userMessage: savedUserMsg || {
        role: 'user',
        content: message.trim(),
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal AI processing error' });
  }
});

/**
 * @route   GET /api/chat/history/:conversationId
 * @desc    Fetch message history for a conversation
 * @access  Public / Optional Auth
 */
router.get('/history/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { language } = req.query;
    const query = { conversationId };
    if (language) {
      query.language = (language || 'en').toLowerCase();
    }
    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({
      success: true,
      conversationId,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/chat/history/:conversationId
 * @desc    Clear conversation history
 * @access  Public / Optional Auth
 */
router.delete('/history/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    await ChatMessage.deleteMany({ conversationId });
    res.json({ success: true, message: 'Conversation history cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/chat/tool/:toolName
 * @desc    Execute direct clinical tool actions from Chatbot Menu
 * @access  Public
 */
router.post('/tool/:toolName', async (req, res) => {
  try {
    const { toolName } = req.params;
    const payload = req.body || {};

    switch (toolName) {
      case 'crcl': {
        const result = calculateCrCl(payload);
        if (!result) {
          return res.status(400).json({ success: false, message: 'Invalid age, weight, or serum creatinine values' });
        }
        return res.json({ success: true, tool: 'crcl', data: result });
      }

      case 'naranjo': {
        const score = typeof payload.score === 'number' ? payload.score : 5;
        const result = evaluateNaranjo(score);
        return res.json({ success: true, tool: 'naranjo', data: result });
      }

      case 'soap': {
        const condition = payload.condition || 'Acute Decompensated Heart Failure';
        const template = generateSoapTemplate(condition);
        return res.json({ success: true, tool: 'soap', data: { condition, template } });
      }

      default:
        return res.status(404).json({ success: false, message: `Tool '${toolName}' not found` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/chat/translate
 * @desc    Translate a clinical message or text into target Indian language
 * @access  Public
 */
router.post('/translate', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Text to translate is required' });
    }

    const targetLang = (language || 'en').toLowerCase();
    if (targetLang === 'en') {
      return res.json({ success: true, translatedText: text, language: 'en' });
    }

    const { translateText } = require('../services/translator.service');
    const translated = await translateText(text, targetLang);
    res.json({ success: true, translatedText: translated, language: targetLang });
  } catch (error) {
    console.error('Chat translation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Translation failed' });
  }
});

module.exports = router;
