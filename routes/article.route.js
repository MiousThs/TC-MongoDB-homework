const express = require('express');
const router = express.Router();

const articleController = require('../controllers/article');

router.post('/', articleController.createArticle);
router.get('/', articleController.returnArticles);
router.put('/:articleId', articleController.updateArticle);
router.delete('/:articleId', articleController.deleteArticle);
router.delete('/', articleController.deleteAll);


module.exports = router;