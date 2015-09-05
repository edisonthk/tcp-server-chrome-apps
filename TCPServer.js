function TcpServer(addr,port,onListenedCallback) {
    this.create(addr,port,onListenedCallback)
};


TcpServer.prototype.setOnRecvCallback = function(cb) {
    this.onRecvCallback = cb;
};

TcpServer.prototype.create = function(addr, port, onListenedCallback) {

    var self = this;

    chrome.sockets.tcpServer.create({}, function(createInfo) {
        self.socketId = createInfo.socketId;
        chrome.sockets.tcpServer.listen(createInfo.socketId,
            addr, port, function(resultCode) {
                if (resultCode < 0) {
                    console.log("Error listening:" + chrome.runtime.lastError.message);
                    return;
                }

                // listen success
                onListenedCallback();

                // set onAccept method
                chrome.sockets.tcpServer.onAccept.addListener(function(info) {
                    self.onAccept(self, info );
                });
            }
        );
    });    
};


TcpServer.prototype.onAccept = function(self, info) {
    if (info.socketId != self.socketId) {
        return;
    }
        

    // A new TCP connection has been established.
    var data = new ArrayBuffer("From server");
    chrome.sockets.tcp.send(info.clientSocketId, data, function(resultCode) {
        console.log("Data sent to new TCP client connection.")
    });

    // Start receiving data.
    chrome.sockets.tcp.onReceive.addListener(function(recvInfo) {
        if (recvInfo.socketId != info.clientSocketId) {
            return;  
        }
        
        // recvInfo.data is an arrayBuffer.
        if(typeof self.onRecvCallback === 'function') {
            var buffer = recvInfo.data;

            // convert Int8 buffer to string
            var dataInString = String.fromCharCode.apply(null, new Uint8Array(buffer));
            self.onRecvCallback(info.clientSocketId, dataInString);
        }
    });

    chrome.sockets.tcp.setPaused(info.clientSocketId,false);
};

TcpServer.prototype.disconnect = function() {
    chrome.sockets.tcpServer.disconnect(this.socketId);
};