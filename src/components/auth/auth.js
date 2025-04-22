const express = require('express');
const router = express.Router();
const db = require('../../firebase/firebase');
const jwt = require('jsonwebtoken');

// JWT secret key - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to log login attempts
async function logLoginAttempt(username, success, req, userId = null, token = null, error = null) {
  try {
    await db.collection('login_logs').add({
      type: 'login_log',
      username,
      userId,
      token,
      timestamp: new Date().toISOString(),
      success,
      error: error ? error.message : null,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  } catch (logError) {
    console.error('Error logging login attempt:', logError);
  }
}

// Authentication route for login
router.post('/login', async (req, res) => {
  const { userId, username, password } = req.body;

  if (!userId || !username || !password) {
    await logLoginAttempt(username, false, req, userId, null, new Error('Missing credentials'));
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef
      .where('userId', '==', userId)
      .where('username', '==', username)
      .where('password', '==', password)
      .get();

    if (snapshot.empty) {
      await logLoginAttempt(username, false, req, userId, null, new Error('Invalid credentials'));
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Get the user document
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId,
        username,
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log successful login
    await logLoginAttempt(username, true, req, userId, token);

    res.json({ 
      success: true, 
      message: 'Login successful',
      token,
      userId,
      username,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    });
  } catch (error) {
    console.error('Login error:', error);
    await logLoginAttempt(username, false, req, null, null, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
