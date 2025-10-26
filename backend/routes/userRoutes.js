const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Update API key
router.put('/api-key', auth, async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    req.user.openaiApiKey = apiKey;
    await req.user.save();

    res.json({ message: 'API key updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { theme, model, temperature, maxTokens } = req.body;
    
    if (theme) req.user.preferences.theme = theme;
    if (model) req.user.preferences.model = model;
    if (temperature !== undefined) req.user.preferences.temperature = temperature;
    if (maxTokens) req.user.preferences.maxTokens = maxTokens;

    await req.user.save();

    res.json({ preferences: req.user.preferences });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;