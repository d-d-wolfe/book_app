'use strict';

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

//app setup (global variables)
const PORT = process.env.PORT || 3000;
const app = express();
const methodOverride= require('method-override');

// pg


// configs/middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(methodOverride('_overrideMethod'));
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new.ejs');
});

app.get('/searches/show', (req, res) => {
  res.render('pages/searches/show.ejs');
});

app.get('/', getBooksFromDB);

app.post('/books', bookToDB);

app.get('/books/:id', bookView);

app.put('/books/:id/update', (req, res) => {
  console.log('body', req.body);
  console.log('params', req.params);
  const sqlUpdate = `UPDATE booktable
  SET (title, author, isbn, description, image_url, bookshelf) VALUES ($1, $2, $3, $4, $5, $6)
  WHERE id=$7`;
  const bookInfo = [req.body.title,req.body.author, req.body.isbn, req.body.description, req.body.image_url, req.body.bookshelf, req.params.id];

  client.query(sqlUpdate, bookInfo)
    .then(() => res.redirect(`/books/${req.params.id}`))
    // .catch(error => {
    //   res.render('pages/error', { 'error': error });
    //   console.error('error from SQL Update', error);
    // });
});

app.get('/pages/error', (req, res) => {
  res.render('pages/error.ejs');
});

app.post('/searches/new', searchNewBook);
//app.post('/searches/show', newBook);

function searchNewBook(req, res) {
  const url = 'https://www.googleapis.com/books/v1/volumes?';
  //console.log(req.body.search);
  const { keyword, type } = req.body.search;
  let q = '';

  if (type === 'title') {
    q += `intitle:${keyword}`;
  } else if (type === 'author') {
    q += `inauthor:${keyword}`;
  } else {
    res.send({ message: 'must be title or author' });
  }

  superagent.get(url)
    .query({ q })
    .then((resultFromSuper) => {
      const resultFromApi = resultFromSuper.body.items;
      const newBook = resultFromApi.map(value => {
        return new Book(value.volumeInfo);
      });
      res.render('pages/searches/show', { 'newBook': newBook });
    })
    .catch(error => {
      res.render('pages/error', { 'error': error });
      console.error('error from Google books API', error);
    });

}

function Book(obj) {
  this.title = obj.title ? obj.title : 'Book Title';
  this.author = obj.authors ? obj.authors : 'Author';
  this.description = obj.description ? obj.description : 'lorem ipsum...';

  if (obj.imageLinks) {
    if (obj.imageLinks.thumbnail[4] === ':') {
      obj.imageLinks.thumbnail = obj.imageLinks.thumbnail.split(':').join('s:');
    }
  }
  this.image = obj.imageLinks ? obj.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.isbn = obj.industryIdentifiers && obj.industryIdentifiers[1] ? obj.industryIdentifiers[1].identifier : 'ISBN UNAVAILABLE';
}

function getBooksFromDB(req, res) {
  const sqlQuery = 'SELECT * FROM booktable';
  client.query(sqlQuery)
    .then(resultFromSql => {
      if (resultFromSql.rowCount > 0) {
        res.render('pages/index', { 'booksFromDB': resultFromSql.rows }); //booksFromDB
      } else {
        res.render('pages/searches/new');
      }
    })
    .catch(error => {
      res.render('pages/error', { 'error': error });
      console.error('error getting books from DB: ', error);
    });
}

function bookToDB(req, res) {
  const saveToSql = 'INSERT INTO booktable (author, title, isbn, image_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6)';
  // array with info from req.body
  const bookInfo = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.description, req.body.bookshelf];
  client.query(saveToSql, bookInfo)
  client.query('SELECT * FROM booktable WHERE isbn=$1', [req.body.isbn])
    .then(resultFromSql =>{
      res.redirect(`/books/${resultFromSql.rows[0].id}`);

    })
    .catch(error => {
      res.render('pages/error', { 'error': error });
      console.error('error getting books from DB: ', error);
    });
}

function bookView(req, res) {
  client.query('SELECT * FROM booktable WHERE id=$1', [req.params.id])
    .then(resultFromSql => {
      res.render('pages/books/show', {bookInfo: resultFromSql.rows[0]});
    });
}


// start the app
app.listen(PORT, console.log(`we are up on ${PORT}`));
