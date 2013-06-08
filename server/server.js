var ws = require('websocket.io');
var server = ws.listen(8080, function() {
        console.log('Ready');
});

server.on('connection', function(socket) {
        socket.on('message', function(data) {
                server.clients.forEach(function(client) {
			if (client != null) {
                        	client.send(data);
			}
                });
        });
});

process.on('uncaughtException', function(err) {
	console.log(err);
});
