const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

router.post('/', userController.createUser);
router.get('/:userId/articles', userController.returnUserArticles);
router.get('/:userId', userController.returnUserInfo)
router.get('/', userController.returnAllUsers);
router.delete('/:userId', userController.deleteUser);
router.put('/:userId', userController.updateUser);


module.exports = router;