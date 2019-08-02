const user = require('../models/user');
const article = require('../models/article');

module.exports = { createUser, returnAllUsers, returnUserInfo, deleteUser, updateUser, returnUserArticles };

function createUser(req, res, next) {
  const payload = req.body;

  return user.create(payload)
    .then(doc => {
      res.send('created');
    })
      .catch(e => {
        console.error(e.message);
        res.json({ status: 400, message: e.message });
      })
}

function returnAllUsers(req, res, next) {
  return user.find({}, (err, users) => {
    if (err) {
      console.error(err.message);
      return res.json({ status: 400, message: err.message });
    }
    if (!users.length) {
      return res.send("no users yet");
    }
    res.json(users);
  });
}

async function returnUserInfo(req, res, next) {
  const artExist = await article.exists({ owner: req.params.userId });
  let listOfArticles;
  (artExist) ? listOfArticles = await article.find({ owner: req.params.userId }) : listOfArticles = { message: "no articles for this user" };
  return user.find({ _id: req.params.userId }, (err, docs) => {
    if (err) {
      return res.json({ status: 400, message: err.message });
    }
    if (!docs.length) {
      return res.json({ status: 404, message: "Wrong userId" });
    }
    console.log(artExist)
    if (artExist) {
      return res.json({ user: docs, articles: listOfArticles });
    }
    res.json(docs);
  }).catch((err) => {
    console.error(err.message);
    res.json({ status: 400, message: err.message });
  })
}

async function deleteUser(req, res) {
  const userExist = await user.exists({ _id: req.params.userId });
  if (!userExist) {
    return res.json({ status: 400, message: "Bad userId" });
  }
  const artExist = await article.find({ owner: req.params.userId });
  if (artExist) {
    await article.deleteMany({ owner: req.params.userId });
  }
  user.deleteOne({ _id: req.params.userId }, (err) => {
    if (err) {
      return res.json({ status: 400, message: err.message });
    }
    res.send("deleted")
  });
}

async function updateUser(req, res, next) {
  const payload = req.body;
  const userExist = await user.exists({ _id: req.params.userId });
  if (payload.firstName && (payload.firstName.length < 4 || payload.firstName.length > 50)) {
    return res.json({ status: 400, message: "Bad first name" });
  }
  if (payload.lastName && (payload.lastName.length < 3 || payload.lastName.length > 60)) {
    return res.json({ status: 400, message: "Bad last name" });
  }
  if (payload.role && !(payload.role === 'admin' || payload.role === 'writer' || payload.role === 'guest')) {
    return res.json({ status: 400, message: "Forbidden role" });
  }
  if (userExist) {
    return user.updateOne({ _id: req.params.userId }, { ...payload }, (err, docs) => {
      if (err) {
        console.error(err.message);
        res.json({ status: 400, message: err.message });
      }
      return res.send('Updated!');
    })
  } else {
    res.json({ status: 404, message: "user does not exist" });
  }
}

async function returnUserArticles(req, res) {
  const userExist = await user.exists({ _id: req.params.userId });
  if (!userExist) {
    return res.json({ status: 400, message: 'Bad userId' });
  }
  const articleExist = await article.exists({ owner: req.params.userId });
  if (!articleExist) {
    return res.send("This user has no articles ");
  }
  return article.find({ owner: req.params.userId }, (err, docs) => {
    if (err) {
      return res.json({ status: 400, message: err.message });
    }
    return res.json(docs);
  })
}