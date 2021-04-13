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

server.post('/searches' , myData);

server.get('*' ,(req,res)=>{
    res.render('pages/error')
} )

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

function BookData (getData) {
    this.title =(getData.volumeInfo.title) ? getData.volumeInfo.title : 'do not have data';
    this.author =(getData.volumeInfo.authors) ? getData.volumeInfo.authors : 'do not have data';
    this.image= (getData.volumeInfo.imageLinks) ? getData.volumeInfo.imageLinks.smallThumbnail :`https://i.imgur.com/J5LVHEL.jpg` ;
    this.description= (getData.volumeInfo.description) ? getData.volumeInfo.description : 'do not have data' ;
}



server.listen(PORT,()=>{
  console.log(`Listening on PORT ${PORT}`);
});
