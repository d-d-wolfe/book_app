'use strict';

const express = require('express');
const superagent = require('superagent');
require('dotenv').config();

//app setup (global variables)
const PORT = process.env.PORT || 3000;
const app = express();

// handlers

// configs/middleware
app.set('view engine', 'ejs');
app.use(express.static('./public'));

app.get('/hello', (req, res) => {
  res.render('pages/index.ejs');
});

app.get('/new', (req, res) => {
  res.render('pages/searches/new.ejs');
});
// start the app
app.listen(PORT, console.log(`we are up on ${PORT}`));