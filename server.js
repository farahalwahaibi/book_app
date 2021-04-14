'use strict';

require( 'dotenv' ).config();

const express= require( 'express' );

const server = express();

const superagent = require( 'superagent' );

const pg = require( 'pg' );

const client = new pg.Client( {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DEV_MODE ? false : { rejectUnauthorized: false },
} );

server.set( 'view engine','ejs' );

server.use( express.static( './public' ) );

server.use( express.urlencoded( {extended:true} ) );

const PORT = process.env.PORT || 3040;

//Routes:
// server.get( '/hello',( req,res )=>{
//   // res.send( 'home page' );
//   res.render( 'pages/index' );
// } );

server.get( '/',( req,res )=>{
  let SQL = 'SELECT * FROM books;';
  client.query( SQL )
    .then( data=>{
      res.render( 'pages/index',{dataArr:data.rows} );
    } )
    .catch( err=>{
      res.render( 'pages/error',{error:err} );
    } );
} );

server.get( '/searches/new',( req,res )=>{
  res.render( 'pages/searches/new' );
} );

server.post( '/searches',( req,res )=>{
  let title = req.body.Search ;
  let searchCat = req.body.searchesCat;
  // console.log( title, 'search' );

  let url = `https://www.googleapis.com/books/v1/volumes?q=+in${searchCat}:${title}`;
  superagent.get( url )
    .then( booksData=>{
      // console.log( 'books', booksData.body.items );
      let data = booksData.body.items ;
      let dataArr = data.map( val=>{
        let newBook = new Book ( val );
        return newBook ;
      } );
      // res.send( dataArr );

      // console.log( dataArr,'dataarr' );
      res.render( 'pages/searches/show',{booksData:dataArr} );

    } )
    .catch( err=>{
      res.render( 'pages/error',{error:err} );
    } );

//   console.log( req.body );
//   res.send( './pages/searches/show' );
} );

server.post( '/books',( req,res )=>{ //insertNewBook into dataBase by click on select this book//
  let {author, title, isbn, image_url, description} = req.body ;
  let SQL = 'INSERT INTO books (author, title, isbn, image_url, description) VALUES ($1,$2,$3,$4,$5) RETURNING *;';
  let safeValues = [author,title,isbn,image_url,description];
  client.query( SQL,safeValues )
    .then( insertingData =>{
      console.log( SQL,'sql' );
      console.log( safeValues,'safe' );
      console.log( insertingData,'insert' );
      res.redirect( `/books/:${insertingData.rows[0].id}` );
      console.log(insertingData);
       ///ask TA??? return to index OR to detail///
      // res.render( 'pages/index',{dataArr2:insertingData.rows} );  ///ask TA ??? return to index and render the whole data inside database + the new data which we insert it///
    } )
    .catch( err =>{
      res.render( 'pages/error',{error:err} );
    } );
} );

server.get( '/books/:id',( req,res )=>{ //on trello /books/:id//
  let SQL = 'SELECT FROM books WHERE id=$1;';
  let safeValues = [req.params.id];
  client.query( SQL,safeValues )
    .then( bookDetails=>{
      res.render( 'pages/books/show',{detailsData:bookDetails.rows[0]} );
    } )
    .catch( err=>{
      res.render( 'pages/error',{error:err} );
    } );
} );

//Constructor:
function Book ( data ){
  this.title = data.volumeInfo.title ;
  this.authors = data.volumeInfo.authors ;
  this.description = data.volumeInfo.description ;
  this.image_url = data.volumeInfo.imageLinks.thumbnail ;
  // this.isbn = data.
  // this.bookShelf = data.
}

server.get( '*',( req,res )=>{
  res.render( 'pages/error' );
} );

client.connect()
  .then( () => {
    server.listen( PORT,( )=>{
      console.log( `listen on PORT ${PORT}` );
    } );
  } );
