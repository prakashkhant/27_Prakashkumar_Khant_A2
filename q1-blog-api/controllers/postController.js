const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');

const deleteFileIfExists = (filePath) => {
  if (!filePath) return;
  const absolute = path.join(__dirname, '..', filePath);
  fs.unlink(absolute, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error(`Failed to delete file ${absolute}:`, err.message);
    }
  });
};

const canModify = (user, post) =>
  user.role === 'admin' || post.author.toString() === user._id.toString();

exports.createPost = async (req, res) => {
  try {
    const { title, content, tags, published } = req.body;

    const post = await Post.create({
      title,
      content,
      tags: tags || [],
      published: Boolean(published),
      author: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Post created', post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error creating post', error: err.message });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: posts.length, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching posts', error: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (!canModify(req.user, post) && !post.published) {
      return res.status(403).json({ success: false, message: 'Forbidden: you cannot view this post' });
    }

    res.status(200).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching post', error: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (!canModify(req.user, post)) {
      return res.status(403).json({ success: false, message: 'Forbidden: not the author or an admin' });
    }

    const { title, content, tags, published } = req.body;
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = tags;
    if (published !== undefined) post.published = Boolean(published);

    await post.save();

    res.status(200).json({ success: true, message: 'Post updated', post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error updating post', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (!canModify(req.user, post)) {
      return res.status(403).json({ success: false, message: 'Forbidden: not the author or an admin' });
    }

    deleteFileIfExists(post.image);

    await post.deleteOne();

    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error deleting post', error: err.message });
  }
};

exports.uploadPostImage = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      if (req.file) deleteFileIfExists(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (!canModify(req.user, post)) {
      if (req.file) deleteFileIfExists(`/uploads/${req.file.filename}`);
      return res.status(403).json({ success: false, message: 'Forbidden: not the author or an admin' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    if (post.image) {
      deleteFileIfExists(post.image);
    }

    post.image = `/uploads/${req.file.filename}`;
    await post.save();

    res.status(200).json({ success: true, message: 'Image uploaded', image: post.image, post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error uploading image', error: err.message });
  }
};
