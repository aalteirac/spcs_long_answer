var http = require('http');
var fs = require('fs');
const path = require('path');
const url = require('url');
const WebSocket = require('ws')
const express = require('express');

const sendInterval = 5000;
const app = express();
let itr;

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/talk', (req,res) => {
    const current_url =new URL(req.url, `http://${req.headers.host}`);
    const search_params = current_url.searchParams;
    var delay = search_params.get('delay');
    if(itr)
        clearInterval(itr)
    sendServerSendEvent(req, res,delay);
    
});

const server = http.createServer(app);
server.listen(8080);

const wss = new WebSocket.Server({ server: server });
wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};
wss.broadcast = function broadcast(msg){
    wss.clients.forEach(function each(client){
        client.send(msg);
    });
  };

function sendSocket(data){
    wss.broadcast(`new socket event  ${data}`)
}

function sendServerSendEvent(req, res,delay) {
    try {
        parseInt(delay);
    } catch (error) {
        delay=sendInterval;
    }
    res.writeHead(200, {
    'Content-Type' : 'text/event-stream',
    'Cache-Control' : 'no-cache',
    'Connection' : 'keep-alive'
    });

    var sseId = (new Date()).toLocaleTimeString();

    itr=setInterval(function() {
        writeServerSendEvent(res, sseId, (new Date()).toLocaleTimeString());
        sendSocket((new Date()).toLocaleTimeString())
    },parseInt (delay) *1000);

    writeServerSendEvent(res, sseId, (new Date()).toLocaleTimeString());
    sendSocket((new Date()).toLocaleTimeString())
}

function writeServerSendEvent(res, sseId, data) {
    res.write('id: ' + sseId + '\n');
    res.write("data: new server event " + data + '\n\n');
}


