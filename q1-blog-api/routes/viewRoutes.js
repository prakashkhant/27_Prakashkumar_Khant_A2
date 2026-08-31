const express = require('express');
const Post = require('../models/Post');
const { protectPage } = require('../middleware/auth');

const router = express.Router();

router.get(['/', '/posts'], async (req, res) => {
  try {
    const posts = await Post.find({ published: true })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.render('posts', { posts });
  } catch (err) {
    res.status(500).send('Server error loading posts');
  }
});

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.get('/add-post', protectPage, (req, res) => {
  res.render('add-post', { user: req.user });
});

router.get('/dashboard', protectPage, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.render('dashboard', { posts, user: req.user });
  } catch (err) {
    res.status(500).send('Server error loading dashboard');
  }
});

module.exports = router;
