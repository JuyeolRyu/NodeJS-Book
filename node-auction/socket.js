const SocketIO = require('socket.io');
module.exports = (server,app) =>{
    const io = SocketIO(server,{path:'/socket.io'});
    app.set('io',io);
    //클라이언트 연결시
    io.on('connection', (socket)=>{
    
        const req = socket.request;
        const {headers:{referer}} = req;
        const roomId = referer.split('/')[referer.split('/').length-1];
        socket.join(roomId);
        //연결이 끊길 경우
        socket.on('disconnect',()=>{
            socket.leave(roomId);
        });
    });
}
