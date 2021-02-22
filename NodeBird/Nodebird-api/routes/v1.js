const express = require('express');
const jwt = require('jsonwebtoken');

const {verifyToken,deprecated} = require('./middlewares');
const {Domain,User,Post,Hashtag} = require('../models');

const router = express.Router();

router.use(deprecated);//v1으로의 접근한 모든 요청에 대해 deprecated 응답을 보낸다
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

router.get('/posts/my',verifyToken,(req,res)=>{
    Post.findAll({where: {userId: req.decoded.id}})
    .then((posts)=>{
        console.log(posts);
        res.json({
            code:200,
            payload: posts,
        });
    })
    .catch((error)=>{
        console.error(error);
        return res.status(500),json({
            code:500,
            message:'서버 에러',
        });
    });
});
router.get('/posts/hashtag/:title', verifyToken, async(req,res)=>{
    try{
        const hashtag = await Hashtag.findOne({
            where:{title: req.params.title}
        });

        if(!hashtag){
            return res.status(404).json({
                code:404,
                message:'검색결과가 없습니다',
            });
        }

        const posts = await hashtag.getPosts();
        return res.json({
            code:200,
            payloads:posts,
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            code:500,
            message:'서버 에러',
        });
    }
});
module.exports = router;