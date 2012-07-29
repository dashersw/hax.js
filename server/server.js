var io = require('socket.io').listen(3001);

io.sockets.on('connection', function(s) {
    s.emit('mahmut');
})