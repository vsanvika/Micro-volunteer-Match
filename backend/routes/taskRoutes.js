const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask, getMyCreatedTasks, getCategories, getTaskWorkspace, updateTaskWorkspace } = require('../controllers/taskController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/my-created', protect, getMyCreatedTasks);
router.get('/:id/workspace', protect, getTaskWorkspace);
router.get('/', optionalAuth, getTasks);
router.get('/:id', optionalAuth, getTaskById);
router.post('/', protect, authorize('requester', 'admin'), createTask);
router.put('/:id', protect, updateTask);
router.put('/:id/workspace', protect, updateTaskWorkspace);
router.delete('/:id', protect, deleteTask);

module.exports = router;
