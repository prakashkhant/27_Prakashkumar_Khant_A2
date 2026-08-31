const express = require('express');
const {
  createPost,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
  uploadPostImage,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { postValidation, mongoIdValidation } = require('../middleware/validators');

const router = express.Router();

router.use(protect);

router.post('/', postValidation, createPost);
router.get('/', getMyPosts);
router.get('/:id', mongoIdValidation, getPostById);
router.put('/:id', mongoIdValidation, postValidation, updatePost);
router.delete('/:id', mongoIdValidation, deletePost);
router.post('/:id/image', mongoIdValidation, uploadSingle('image'), uploadPostImage);

module.exports = router;
