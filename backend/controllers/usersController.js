const express = require('express');
const router = express.Router();

// -- START custom utility -----------------------------------------------------------------------------------------------------
const createRes = require('../utils/createRes');
// -- END custom utility -----------------------------------------------------------------------------------------------------

// -- START importing models -----------------------------------------------------------------------------------------------------
const User = require('../models/User');
const { find } = require('../models/User');
// -- END importing models -----------------------------------------------------------------------------------------------------


router.get('/', async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json(createRes(users));
  } catch (err) {
    console.log(err);
    res.status(500).json(createRes(err, true));
  }
});

router.post('/new', async (req, res) => {
  try {
    const bookId = parseInt(req.body.id);
    const arr = await Book.find({ bookId });
    if (arr.length != 0) throw new Error(`Record with id = ${bookId} already exists.`);

    const book = new Book({
      bookId,
      title: req.body.title,
      author: req.body.author,
      price: parseInt(req.body.price)
    });

    const result = await Book.create(book);

    res.status(200).json(createRes(result));
  } catch (err) {
    console.log(err);
    res.status(500).json(createRes(err, true));
  }
});

router.put('/update', async (req, res) => {
  try {
    const bookId = parseInt(req.body.id);
    const book = {
      title: req.body.title,
      author: req.body.author,
      price: parseInt(req.body.price)
    };

    const result = await Book.findOneAndUpdate({ bookId }, { $set: book });

    res.status(200).json(createRes(result));
  } catch (err) {
    console.log(err);
    res.status(500).json(createRes(err, true));
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await Book.findOneAndDelete({ bookId: id });

    res.status(200).json(createRes(result));
  } catch (err) {
    console.log(err);
    res.status(500).json(createRes(err, true));
  }
});


module.exports = router;