const SocketIO = require('socket.io');
const axios = require('axios');

module.exports = (server,app,sessionMiddleware) => {
    //익스프레스 서버와 소켓.IO 패키지를 연결
    const io = SocketIO(server, { path: '/socket.io' });
    //라우터에서 io객체 사용가능하게 저장한다 req.app.get('io')로 접근 가능
    app.set('io',io);
    //io.of socket.io에 네임스페이스를 부여하는 메서드
    const room = io.of('/room');
    const chat = io.of('/chat');

    io.use((socket,next)=>{
        sessionMiddleware(socket.request, socket.request.res, next);
    });
    //이벤트리스너 추가
    room.on('connection', (socket)=>{
        console.log("room 네임스페이스에 접속");
        socket.on('disconnect',()=>{
            console.log('room 네임스페이스 접속 해제');
        });
    });
    chat.on('connection', (socket)=>{
        console.log("chat 네임스페이스에 접속");
        const req = socket.request;
        const {headers:{referer}} = req;
        const roomId = referer
            .split('/')[referer.split('/').length-1]
            .replace(/\?.+/,'');
        //각각의 방에 들어가고 나가는 메서드
        socket.join(roomId);
        socket.to(roomId).emit('join',{
            user:'system',
            chat: `${req.session.color}님이 입장하셨습니다.`,
        });
        socket.on('disconnect',()=>{
            console.log('chat 네임스페이스 접속 해제');
            socket.leave(roomId);

            const currentRoom = socket.adapter.rooms[roomId];
            const userCount = currentRoom ? currentRoom.length: 0;
            if(userCount === 0){
                axios.delete(`http://localhost:8005/room/${roomId}`)
                .then(()=>{
                    console.log('방 제거 요청 성공');
                })
                .catch((error)=>{
                    console.error(error);
                });
            }else{
                socket.to(roomId).emit('exit',{
                    user:'system',
                    chat: `${req.session.color}님이 퇴장하셨습니다.`,
                });
            }
        });
    });
    // //connection => 클라이언트가 서버와 웹소켓 연결을 맺을 떄 발생하는 이벤트이다.
    // io.on('connection', (socket)=>{
    //     //socket.request 속성으로 요청객체에 접근할수 있다
    //     //socket.request.res는 응답객체 접근
    //     const req = socket.request;
    //     //클라이언트의 IP 알아내는 방법
    //     const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    //     //socket.id로 소켓 고유의 아이디 가져올수 있다
    //     console.log('새로운 클라이언트 접속',ip,socket.id,req.ip);

    //     //연결을 끊었을 경우
    //     socket.on('disconnect',()=>{
    //         console.log('클라이언트 접속 해제',ip,socket.id);
    //         //인터벌 정리(메모리 누수 방지)
    //         clearInterval(socket.interval);
    //     });
    //     //연결에 문제가 생겼을 경우
    //     socket.on('error',(error)=>{
    //         console.error(error);
    //     });
    //     //클라이언트로 부터 메세지 받았을 경우
    //     socket.on('reply',(data)=>{
    //         console.log(data);
    //     });
        
        
    //     //3초마다 연결된 모든 클라이언트에게 메세지를 보낸다
    //     socket.interval = setInterval(()=>{
    //         //readyState가 open인지 확인한다.
    //         //웹소켓 상태 => CONNECTING(연결 중), OPEN(열림), CLOSING(닫는 중), CLOSED(닫힘)
    //         //emit(이벤트 이름,인자의 데이터)
    //         //클라이언트가 이 메세지를 받으려면 news 이벤트 리스너를 만들어야 한다 => index.pug
    //         socket.emit('news','Hello Socket.IO');
    //     },3000);
};
