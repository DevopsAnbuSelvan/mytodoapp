const express = require('express');
const router = express.Router();
const db = require('../../firebase/firebase');

// Route to serve welcome message
router.get('/', async (req, res) => {
  try {
    const doc = await db.collection('messages').doc('welcome').get();
    if (doc.exists) {
      res.send(doc.data().text);
    } else {
      res.send('Welcome message not found.');
    }
  } catch (error) {
    res.status(500).send('Something went wrong.');
  }
});

module.exports = router;
