const express = require('express');
const jwt = require('jsonwebtoken');

const {verifyToken} = require('./middlewares');
const {Domain,User,Post,Hashtag} = require('../models');

const router = express.Router();

router.post('/token',async(req,res)=>{
    const {clientSecret} = req.body;
    try{
        const domain = await Domain.findOne({
            where:{clientSecret},
            include:{
                model: User,
                attribute:['nick','id'],
            },
        });
        
        if(!domain){
            return res.statusCode(401).json({
                code:401,//코드를 일관성있게 설정해줘서 코드만 보고 에러를 알수 있게 한다
                message:'등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요',
            });
        }
        const token = jwt.sign({//사용자의 아이디와 닉네임
            id: domain.user.id,
            nick: domain.user.nick,
        },process.env.JWT_SECRET,//토큰의 비밀키
        {//토큰의 설정
            expiresIn:'1m',//유효기간
            issuer:'nodebird',//발급자
        });

        return res.json({
            code: 200,
            message: '토큰이 발급되었습니다',
            token,
        });
    }catch(error){
        console.error(error);
        return res.statusCode(500).json({
            code:500,
            message:'서버 에러',
        });
    }
});

router.get('/test',verifyToken,(req,res)=>{
    res.json(req.decoded);
});
module.exports = router;