const mongoose = require('mongoose');
const {MONGO_ID,MONGO_PASSWORD,NODE_ENV} = process.env;
const MONGO_URL = `mongodb://${MONGO_ID}@localhost:27017/admin`;

module.exports = () => {
    const connect = () => {
        //배포버전이 아닌 경우
        if(NODE_ENV !== 'production'){
            mongoose.set('debug',true);
        }
        //몽구스 DB 연결
        mongoose.connect(MONGO_URL,{
            dbName:'nodeplace',
        },(err)=>{
            if(err){
                console.log('몽고디비 연결 에러',err);
            }else{
                console.log('몽고디비 연결 성공');
            }
        });
    };
    connect();
    
    mongoose.connection.on('error', (error)=>{
        console.error('몽고디비 연결 에러',error);
    });
    mongoose.connection.on('disconnected', ()=>{
        console.error('몽고디비 연결이 끊겼습니다. 다시 연결을 시도합니다.');
        connect();
    });

    require('./favorite');
    require('./history');
};