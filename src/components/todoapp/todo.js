const express = require('express');
const router = express.Router();
const db = require('../../firebase/firebase');
const { FieldValue } = require('firebase-admin/firestore');

// Get all todo
router.get('/read', async (req, res) => {
    try {
      const snapshot = await db.collection('todo')
        .orderBy('createdAt', 'desc')
        .get();

      const todo = [];
      snapshot.forEach(doc => {
        todo.push({ id: doc.id, ...doc.data() });
      });
      res.json(todo);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
// Add a new todo
router.post('/create', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const newTodo = {
      title,
      content,
      isCompleted: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('todo').add(newTodo);
    res.status(201).json({ id: docRef.id, ...newTodo });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// complete todo
router.put('/complete', async (req, res) => {
  const { id, isCompleted } = req.body;
  
  if (!id) {
    return res.status(400).json({ message: 'Todo ID is required' });
  }

  try {
    const todoRef = db.collection('todo').doc(id);
    const doc = await todoRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    await todoRef.update({
      isCompleted: isCompleted,
      updatedAt: FieldValue.serverTimestamp()
    });

    res.json({ message: 'Todo completion status updated' });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// Delete a todo
router.delete('/delete', async (req, res) => {
  const { id } = req.body;
  handleDelete(id, req, res);
});
async function handleDelete(id, req, res) {
  if (!id) {
    return res.status(400).json({ message: 'Todo ID is required' });
  }

  try {
    const todoRef = db.collection('todo').doc(id);
    const doc = await todoRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    await todoRef.delete();
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

module.exports = router;
