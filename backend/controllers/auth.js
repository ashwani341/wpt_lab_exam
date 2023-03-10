const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
  createJWT,
} = require("../utils/auth");
const usernameRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
exports.signup = (req, res, next) => {
  let { name, address, telephoneNo, adharNo, username, password, password_confirmation } = req.body;
  let errors = [];
  if (!name) {
    errors.push({ name: "required" });
  }
  if (!address) {
    errors.push({ address: "required" });
  }
  if (!telephoneNo) {
    errors.push({ telephoneNo: "required" });
  }
  if (!adharNo) {
    errors.push({ adharNo: "required" });
  }
  if (!username) {
    errors.push({ username: "required" });
  }
  if (!usernameRegexp.test(username)) {
    errors.push({ username: "invalid" });
  }
  if (!password) {
    errors.push({ password: "required" });
  }
  if (!password_confirmation) {
    errors.push({
      password_confirmation: "required",
    });
  }
  if (password != password_confirmation) {
    errors.push({ password: "mismatch" });
  }
  if (errors.length > 0) {
    return res.status(422).json({ errors: errors });
  }
  User.findOne({ username: username })
    .then(user => {
      if (user) {
        return res.status(422).json({ errors: [{ user: "username already exists" }] });
      } else {
        const user = new User({
          name: name,
          address,
          telephoneNo,
          adharNo,
          username: username,
          password: password,
        });
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(password, salt, function (err, hash) {
            if (err) throw err;
            user.password = hash;
            user.save()
              .then(response => {
                res.status(200).json({
                  success: true,
                  result: response
                });
              })
              .catch(err => {
                res.status(500).json({
                  errors: [{ error: err }]
                });
              });
          });
        });
      }
    }).catch(err => {
      res.status(500).json({
        errors: [{ error: 'Something went wrong' }]
      });
    });
};
exports.signin = (req, res) => {
  let { username, password } = req.body;
  let errors = [];
  if (!username) {
    errors.push({ username: "required" });
  }
  if (!usernameRegexp.test(username)) {
    errors.push({ username: "invalid username" });
  }
  if (!password) {
    errors.push({ passowrd: "required" });
  }
  if (errors.length > 0) {
    return res.status(422).json({ errors: errors });
  }
  User.findOne({ username: username }).then(user => {
    if (!user) {
      return res.status(404).json({
        errors: [{ user: "not found" }],
      });
    } else {
      bcrypt.compare(password, user.password).then(isMatch => {
        if (!isMatch) {
          return res.status(400).json({
            errors: [{
              password:
                "incorrect"
            }]
          });
        }
        let access_token = createJWT(
          user.username,
          user._id,
          3600
        );
        jwt.verify(access_token, process.env.TOKEN_SECRET, (err,
          decoded) => {
          if (err) {
            res.status(500).json({ erros: err });
          }
          if (decoded) {
            return res.status(200).json({
              success: true,
              token: access_token,
              message: user
            });
          }
        });
      }).catch(err => {
        res.status(500).json({ erros: err });
      });
    }
  }).catch(err => {
    res.status(500).json({ erros: err });
  });
};