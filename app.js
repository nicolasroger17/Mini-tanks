var app = require('express')(),
    express = require('express'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

app.use('/public', express.static(__dirname + "/public"));

// Chargement de la page index.html
app.get('/', function (req, res) {
    console.log("dirname : " + __dirname);
    res.sendfile(__dirname + '/index.html');
});

var pseudoList = Array();
io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.set('pseudo', pseudo);
        pseudoList.push(pseudo);
        socket.broadcast.emit('refreshPlayers', pseudoList);
        socket.emit('refreshPlayers', pseudoList);
    });

    socket.on('gameStart', function(){
        initializeTanks();
        socket.broadcast.emit('newGame', tanks);
        socket.emit('newGame', tanks);
    });

    var thisPseudo = "";
    socket.on('left', function(){
        socket.get('pseudo', function(error, pseudo){
            for(var tank in tanks){
                if(tanks[tank].name == pseudo){
                    if(tanks[tank].position.left > 0)
                        tanks[tank].position.left -= 10;
                    socket.emit('updateTank', tanks[tank]);
                    socket.broadcast.emit('updateTank', tanks[tank]);
                }
            }
        });        
    });
    socket.on('up', function(){
        socket.get('pseudo', function(error, pseudo){
            for(var tank in tanks){
                if(tanks[tank].name == pseudo){
                    if(tanks[tank].position.top > 0)
                        tanks[tank].position.top -= 10;
                    socket.emit('updateTank', tanks[tank]);
                    socket.broadcast.emit('updateTank', tanks[tank]);
                }
            }
        });        
    });
    socket.on('right', function(){
        socket.get('pseudo', function(error, pseudo){
            for(var tank in tanks){
                if(tanks[tank].name == pseudo){
                    if(tanks[tank].position.left < 1210)
                        tanks[tank].position.left += 10;
                    socket.emit('updateTank', tanks[tank]);
                    socket.broadcast.emit('updateTank', tanks[tank]);
                }
            }
        });        
    });
    socket.on('down', function(){
        socket.get('pseudo', function(error, pseudo){       
            for(var tank in tanks){
                if(tanks[tank].name == pseudo){
                    if(tanks[tank].position.top < 730)
                        tanks[tank].position.top += 10;
                    socket.emit('updateTank', tanks[tank]);
                    socket.broadcast.emit('updateTank', tanks[tank]);
                }
            }
        });
    });
});

var tanks = Array();
var walls = Array();
var missiles = Array();

var defaultPosition = Array({top: 40, left: 40}, {top: 720, left: 1200});
function initializeTanks(){
    for(var i = 0; i < pseudoList.length; i++){
        tanks.push({name: pseudoList[i], position: defaultPosition[i]});
    }
}


server.listen(8080);