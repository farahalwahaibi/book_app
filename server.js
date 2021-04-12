'use strict';

require( 'dotenv' ).config();

const express= require( 'express' );

const server = express();

const superagent = require( 'superagent' );

server.set( 'view engine','ejs' );

server.use( express.static( './public' ) );

server.use( express.urlencoded( {extended:true} ) );

const PORT = process.env.PORT || 3040;

//Routes:

server.get( '/hello',( req,res )=>{
  // res.send( 'home page' );
  res.render( 'pages/index' );
} );

server.get( '/searches/new',( req,res )=>{
  res.render( 'pages/searches/new' );
} );

server.post( '/searches',( req,res )=>{
  let title = req.query.Search ;
  let author = req.query.Author ;
  console.log( title, 'search' );

  let url = `https://www.googleapis.com/books/v1/volumes?q=${title}`;
  superagent.get( url )
    .then( booksData=>{
      console.log( 'books', booksData.body.items );
      let data = booksData.body.items ;
      let dataArr = data.map( val=>{
        let newBook = new Book ( val );
        return newBook ;
      } );
      // res.send( dataArr );

      console.log( dataArr,'dataarr' );
      res.render( 'pages/searches/show',{booksData:dataArr} );
    } );

//   console.log( req.body );
//   res.send( './pages/searches/show' );
} );


//Constructor:

function Book ( data ){
  this.title = data.volumeInfo.title ;
  this.authors = data.volumeInfo.authors ;
  this.description = data.volumeInfo.description ;
  this.image = data.volumeInfo.imageLinks.thumbnail ;
  // globalArr.push(this);
}


server.listen( PORT,( req,res )=>{
  console.log( `listen on PORT ${PORT}` );
} );

// let globalArr = [];
