const article = require('../models/article');
const user = require('../models/user');

module.exports = { createArticle, returnArticles, deleteAll, updateArticle, deleteArticle };

async function createArticle(req, res, next) {
    const payload = req.body
    const userExist = await user.exists({ _id: payload.owner });
    if (!userExist) {
        return res.json({ status: 400, message: 'User does not exist' });
    }
    await article.create(payload);
    return article.find({ owner: payload.owner }, (err, docs) => {
        if (err) {
            res.json({ status: 400, message: err.message });
        }
        user.updateOne({ _id: payload.owner }, { numberOfArticles: docs.length }, (err) => {
            if (err) {
                return res.json({ status: 400, message: err.message });
            }
        });
        res.send("created!");
    })
}

async function returnArticles(req, res, next) {
    const payload = {};
    
    if (req.body.title) { payload.title = req.body.title }
    if (req.body.subtitle) { payload.subtitle = req.body.subtitle }
    if (req.body.description) { payload.description = req.body.description }
    if (req.body.owner) { payload.owner = req.body.owner }
    if (req.body.category) { payload.category = req.body.category }
    if (req.body.createdAt) { payload.createdAt = req.body.createdAt }
    if (req.body.updatedAt) { payload.updatedAt = req.body.updatedAt }

    let articleExist = await article.exists({...payload}).catch(err => { return false });

    if (articleExist) {
        return article.find({ ...payload }, (err, articles) => {
            if (err) {
                console.error(err.message);
                return res.json({ status: 400, message: err.message });
            }
            if (!articles.length) {
                return res.send('no articles');
            }
        }).populate('owner').exec((err, foundArticles) => {
            if (err) {
                console.error(err.message);
                return res.json({ status: 400, message: err.message });
            }
            return res.json(foundArticles);
        })
    } else {
        res.send('no articles');
    }
}


// async function updateArticle(req, res, next) {
//     const articleExist = await article.exists({ _id: req.params.articleId });
//     if (!articleExist) {
//         return res.json({ status: 400, message: "Bad articleId" });
//     }

//     const payload = {};
//     if (req.body.title && (req.body.title.length >= 5 && req.body.title.length <= 400)) {
//         payload.title = req.body.title;
//     }
//     if (req.body.subtitle && (req.body.subtitle.length >= 5)) {
//         payload.subtitle = req.body.subtitle;
//     }
//     if (req.body.description && (req.body.description.length >= 5 && req.body.description.length <= 5000)) {
//         payload.description = req.body.description;
//     }
//     if (req.body.owner) {
//         return res.json({ status: 400, message: "can`t change owner" })
//     }
//     if (req.body.category && (req.body.category === 'sport' || req.body.category === 'games' || req.body.category === 'history')) {
//         payload.category = req.body.category;
//     }
//     if (Object.getOwnPropertyNames(payload).length === 0) {
//         return res.json({ status: 400, message: "no valid params to update" });
//     }

//     return article.updateOne({ _id: req.params.articleId }, { ...payload, updatedAt: Date.now() }, (err, docs) => {
//         if (err) {
//             return res.json({ status: 400, message: err.message });
//         }
//         return res.send('updated');
//     })
// }

async function updateArticle(req, res, next) {
    const articleExist = await article.exists({ _id: req.params.articleId });
    if (!articleExist) {
        return res.json({ status: 400, message: "Bad articleId" });
    }

    const articleToUpdate = await article.findOne({ _id: req.params.articleId }, (err, docs) => {
        if (err) {
            return res.json({ status: 400, message: err.message });
        }
        return docs;
    });
    const articleToUpdateOwner = articleToUpdate.owner;

    const payload = {};
    if (req.body.title && (req.body.title.length >= 5 && req.body.title.length <= 400)) {
        payload.title = req.body.title;
    }
    if (req.body.subtitle && (req.body.subtitle.length >= 5)) {
        payload.subtitle = req.body.subtitle;
    }
    if (req.body.description && (req.body.description.length >= 5 && req.body.description.length <= 5000)) {
        payload.description = req.body.description;
    }
    if (req.body.owner) {
        const userExist = await user.exists({ _id: req.body.owner });
        if (userExist) {
            payload.owner = req.body.owner;
            await user.findOne({ _id: req.body.owner }, (err, docs) => {
                if (err) {
                    return res.json({ status: 400, message: err.message });
                }
                const newNumb = docs.numberOfArticles + 1;
                user.updateOne({ _id: req.body.owner }, { numberOfArticles: newNumb }, err => {
                    if (err) {
                        return res.json({ status: 400, message: err.message });
                    }
                    return;
                });
            });
            console.log(articleToUpdateOwner)
            await user.findOne({ _id: articleToUpdateOwner }, (err, docs) => {
                if (err) {
                    return res.json({ status: 400, message: err.message });
                }
                console.log(docs)
                const newNumb = docs.numberOfArticles - 1;
                user.updateOne({ _id: articleToUpdateOwner }, { numberOfArticles: newNumb }, err => {
                    if (err) {
                        return res.json({ status: 400, message: err.message });
                    }
                    return;
                });
            })
        }
    }
    if (req.body.category && (req.body.category === 'sport' || req.body.category === 'games' || req.body.category === 'history')) {
        payload.category = req.body.category;
    }
    if (Object.getOwnPropertyNames(payload).length === 0) {
        return res.json({ status: 400, message: "no valid params to update" });
    }

    return article.updateOne({ _id: req.params.articleId }, { ...payload, updatedAt: Date.now() }, (err, docs) => {
        if (err) {
            return res.json({ status: 400, message: err.message });
        }
        return res.send('updated');
    })
}


async function deleteArticle(req, res, next) {
    const articleExist = await article.exists({ _id: req.params.articleId });
    if (!articleExist) {
        return res.json({ status: 400, message: 'Bad articleID' });
    }
    const articleToDelete = await article.findOne({ _id: req.params.articleId }, (err, docs) => {
        if (err) {
            return res.json({ status: 400, message: err.message });
        }
        return docs;
    });
    const ownerId = articleToDelete.owner;
    await article.find({ owner: ownerId }, (err, docs) => {
        if (err) {
            res.json({ status: 400, message: err.message });
        }
        user.updateOne({ _id: ownerId }, { numberOfArticles: docs.length - 1 }, (err) => {
            if (err) {
                return res.json({ status: 400, message: err.message });
            }
        });
    })
    return article.deleteOne({ _id: req.params.articleId }, err => {
        if (err) {
            return res.json({ status: 400, message: err.message });
        } 
        res.send("deleted");
    })
}

function deleteAll(req, res) {
    article.deleteMany({}, () => res.send('done'));
}