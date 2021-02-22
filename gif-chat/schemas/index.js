const mongoose = require('mongoose');
const {MONGO_ID, MONGO_PASSWORDM, NODE_ENV} = process.env;
const MONGO_URL = `mongodb://${MONGO_ID}@localhost:27017/admin`;

module.exports = () =>{
    const connect = () =>{
        if(NODE_ENV !== 'production'){
            mongoose.set('debug',true);
        }
        mongoose.connect(MONGO_URL,{
            dbname:'gifchat',
        },(error)=>{
            if(error){
                console.log('몽고디비 연결 에러',error);
            }else{
                console.log('몽고디비 연결 성공');
            }
        });
    };
    connect();

    mongoose.connection.on('error',(error)=>{
        console.error('몽고 디비 연결 에러',error);
    });
    mongoose.connection.on('disconnected',()=>{
        console.error('몽고디비 연결이 끊어졌습니다. 연결을 재시도 합니다');
        connect();
    });

    require('./chat');
    require('./room');
};