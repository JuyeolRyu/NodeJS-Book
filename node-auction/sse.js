const sse = require('sse');
const SSE = require('sse/lib/sse');
//server sent event
module.exports = (server) => {
    const sse = new SSE(server);
    //클라이언트와 연결시 실행될 이벤트
    sse.on('connection',(client)=>{
        //1초마다 현재 시간을 보낸다
        setInterval(()=>{
            client.send(new Date().valueOf().toString());
        },1000);
    });
}