'use strict';

require('dotenv').config();

const express = require('express');

const superagent=require('superagent');

const server = express();

server.use(express.static('./public'));
server.set('view engine','ejs');

server.use(express.urlencoded({extended:true}));

const PORT = process.env.PORT || 3030;

server.get('/',(req,res)=>{
  res.render('pages/index');
});


server.get('/searches/new' , (req,res)=>{
    res.render('./pages/searches/new');
} );

server.get('/searches/show' , myData);

server.get('*' ,(req,res)=>{
    res.render('pages/error' ,)
} )

function myData (req, res){

    let title= req.query.search;
    let select = req.query.select;
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

function BookData (getData) {
    this.title =getData.volumeInfo.title;
    this.author =getData.volumeInfo.authors;
    this.image= getData.volumeInfo.imageLinks.smallThumbnail;
    this.description= getData.volumeInfo.description;
}



server.listen(PORT,()=>{
  console.log(`Listening on PORT ${PORT}`);
});
