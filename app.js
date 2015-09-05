(function() {

var onListenedCallback = function() {
    console.log("Listen");
}

var onRecvCallback = function(clientSocketId, data) {
    console.log(data);
}

var server = new TcpServer("127.0.0.1",8080,onListenedCallback);
server.setOnRecvCallback(onRecvCallback);

})();