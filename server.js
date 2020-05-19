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

app.post('/searches/new', searchNewBook);

function searchNewBook(req, res) {
  const url = 'https://www.googleapis.com/books/v1/volumes?q=';
  console.log(req.body);
  res.render('pages/searches/new');
}

// when we select title or author and we combine it with whatever the search string is in the text input, our URL that we get back is going to = request.body.search[0].

function Book(obj) {
  this.image = obj.image ? obj.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = obj.title ? obj.title : 'Book Title';
  this.author = obj.authors ? obj.authors : 'Author';
  this.description = obj.description ? obj.description : 'lorem ipsum...';
}





// start the app
app.listen(PORT, console.log(`we are up on ${PORT}`));