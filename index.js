var http = require('http');
var fs = require('fs');
const path = require('path');
const url = require('url');
const WebSocket = require('ws')
const express = require('express');

const sendInterval = 5000;
const app = express();
let itr;
let itr2;

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/talk', (req,res) => {
    const current_url =new URL(req.url, `http://${req.headers.host}`);
    const search_params = current_url.searchParams;
    var delay = search_params.get('delay');
    var type = search_params.get('type');
    if(itr)
        clearInterval(itr)
    if(itr2)
        clearInterval(itr2)
   launch(req,res,delay,type)
    
});

const server = http.createServer(app);
server.listen(8080);

const wss = new WebSocket.Server({ server: server });

wss.broadcast = function broadcast(msg){
    wss.clients.forEach(function each(client){
        client.send(msg);
    });
  };

function sendSocket(data){
    wss.broadcast(`new socket event  ${data}`)
}

function launch(req, res,delay,type){
    var sseId = (new Date()).toLocaleTimeString();
    if (type=='ws'){
        sendSocket(sseId)
        itr=setInterval(function() {
            sendSocket((new Date()).toLocaleTimeString())
        },parseInt (delay) *1000);
        res.send('OK')
    }    
    if (type=='sse'){
        res.writeHead(200, {
            'Content-Type' : 'text/event-stream',
            'Cache-Control' : 'no-cache',
            'Connection' : 'keep-alive'
            });
        writeServerSendEvent(res, sseId, (new Date()).toLocaleTimeString());  
        itr2=setInterval(function() {
            writeServerSendEvent(res, sseId, (new Date()).toLocaleTimeString());  
        },parseInt (delay) *1000);  
    }
        
}

function writeServerSendEvent(res, sseId, data) {
    res.write('id: ' + sseId + '\n');
    res.write("data: new server event " + data + '\n\n');
}


