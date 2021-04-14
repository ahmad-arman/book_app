'use strict';

require('dotenv').config();

const express = require('express');

const superagent=require('superagent');

const server = express();

const pg = require('pg');


// const client = new pg.Client(process.env.DATABASE_URL);
// const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client( { connectionString: process.env.DATABASE_URL,
  // ssl:{rejectUnauthorized: false
  // }

} );

server.use(express.static('./public'));
server.set('view engine','ejs');

server.use(express.urlencoded({extended:true}));

const PORT = process.env.PORT || 3030;

server.get('/',homeHandler);
// server.get('/addBook',addHandler);

// function addHandler (req,res){}

function homeHandler (req,res){
    
        let SQL = `SELECT * FROM books ;`;
        client.query( SQL )
          .then( results => res.render( 'pages/index', {books: results.rows} ) );
          
        // res.render( 'pages/index' );
      

 
}


server.get('/searches/new' , (req,res)=>{
    res.render('./pages/searches/new');
} );

server.post('/searches' , myData);
server.post('/books',addBookHandler )
server.get('/books/:id' ,renderOneBook);



function myData (req, res){

    let title= req.body.search;
    let select = req.body.select;
    let url = `https://www.googleapis.com/books/v1/volumes?q=+in${select}:${title}`;

    superagent.get(url)
    .then(element =>{
        // res.send(element.body.items);
        
        let newArray = element.body.items.map(item=>{
            return new BookData (item) ;
        });
        res.render('pages/searches/show' , {bookDataArray:newArray});
    });
}

function addBookHandler(req,res) {
    // console.log(req.query);
    let {title,author,isbn,image,description} = req.body;
    let SQL = `INSERT INTO books (image,title,author,isbn,description) VALUES ($1,$2,$3,$4,$5) RETURNING *;`;
   
    let safeValues = [image,title,author,isbn,description];
    console.log(safeValues);
    client.query(SQL,safeValues)
      .then(result=>{
        console.log(result.rows)
        // res.render('index');
        // res.redirect('/'); //localhost:3000/
        // getTasks()
        res.redirect(`/books/${result.rows[0].id}`)
        // res.render('pages/books/detail' , {item:result.rows[0]});
      })
  }

  function renderOneBook(req, res){
let sql = `SELECT * FROM books WHERE id=$1;`;
let saveValue = [req.params.id]
client.query(sql, saveValue)
.then (result =>{
  res.render('pages/books/detail' , {item:result.rows[0]});
})
  }

function BookData (getData) {
    this.title =(getData.volumeInfo.title) ? getData.volumeInfo.title : 'do not have data';
    this.author =(getData.volumeInfo.authors) ? getData.volumeInfo.authors : 'do not have data';
    this.isbn = (getData.volumeInfo.industryIdentifiers) ?  getData.volumeInfo.industryIdentifiers[0].identifier : 'do not have data' ;
    this.image= (getData.volumeInfo.imageLinks) ? getData.volumeInfo.imageLinks.smallThumbnail :'https://i.imgur.com/J5LVHEL.jpg' ;
    this.description= (getData.volumeInfo.description) ? getData.volumeInfo.description : 'do not have data' ;
}


server.get('*' ,(req,res)=>{
  res.render('pages/error')
} )

 
client.connect()
.then(() => {
  server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
})

