require('dotenv').config();
const express = require('express');
const authRouter = require('./src/components/auth/auth');
const welcomeRouter = require('./src/components/welcome/welcome');
const todoRouter = require('./src/components/todoapp/todo');
const app = express();
const PORT = process.env.PORT;

// Middleware to parse JSON from requests
app.use(express.json());

// Use welcome routes
app.use('/api/welcome', welcomeRouter);

// Use auth routes
app.use('/api/auth', authRouter);

// Use todo routes with /api prefix
app.use('/api/todo', todoRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
