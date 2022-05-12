'use strict';
const express = require('express');
const app = express();
//För att använda cookies vid socketanrop
const http = require('http').createServer(app);
const myModule = require('./my-module.js');
const cookieParser = require('cookie-parser');
const io = require('socket.io')(http);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
//Gör mappen klientfiler statisk
app.use('/public', express.static(__dirname + '/Klientfiler'));

let server = http.listen(3001, ()=>{
    console.log("server running on port ", server.address().port);
});

app.get('/', function(req, res) {
    let cookie = req.cookies.nickName;

    if(cookie === undefined) 
        res.sendFile(__dirname + '/loggain.html');
    else
        res.sendFile(__dirname + '/');

});

app.get('/favicon.ico', function(req, res) {
    res.sendFile(__dirname + '/favicon.ico');
});

app.post('/', function(req, res) {
    res.cookie('nickName', req.body.nickname, {maxAge: 1000*60*60});
    console.log("kaka satt");
    res.redirect('/');
});

io.on('connection', function(socket) {
    //Lång sträng av cookies
    let cookieString = socket.handshake.headers.cookie;
    //Gör det lättare att hitta specifika cookies från cookieString
    let cookieList = myModule.parseCookies(cookieString);

    if(cookieList.nickName != null) {
        //Skapar socket.nickName för att se namnet på den som anropade
        socket.nickName = cookieList.nickName;
    }

    socket.on('newBackGround', function(data) {
        io.emit('bytbild', {'imageid': data.backgroundid, 'time': myModule.getTimeStamp(), 
        'name': socket.nickName});

    });
});