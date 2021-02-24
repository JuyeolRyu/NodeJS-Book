const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const {User} = require('../models');

const router = express.Router();

//회원 가입하는 라우터
router.post('/join',isNotLoggedIn, async(req,res,next) => {
    //제출된 가입정보(req.body)에 들어있음
    const {email,nick,password,money} = req.body;
    console.log(email,nick,password,money);
    try{
        const exUser = await User.findOne({where: {email} });
        //이미 가입된 이메일인 경우
        if(exUser){
            req.flash('joinError','이미 가입된 이메일입니다.');
            return res.redirect('/join');
        }
        //비밀번호 해시화 후에 User테이블에 데이터 추가
        const hash = await bcrypt.hash(password,12);
        await User.create({
            email,
            nick,
            password: hash,
            money,
        });
        //홈으로 리다이렉트
        return res.redirect('/');
    }catch(error){
        console.error(error);
        next(error);
    }
});

//로그인 라우터
router.post('/login',isNotLoggedIn, async(req,res,next)=>{
    //localStategy.js에서 done함수 실행될때 실행된다.
    passport.authenticate('local',(authError,user,info)=>{
        //로그인 에러 발생시
        if(authError){
            console.error(authError);
            return next(authError);
        }
        if(!user){
            req.flash('loginError',info.message);
            return res.redirect('/');
        }
        return req.login(user,(loginError)=>{
            if(loginError){
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req,res,next);
});
//로그아웃 라우터
router.get('/logout',isLoggedIn, (req,res)=>{
    //req.user에 들어있는 로그인 세션이 사라짐
    req.logout();
    //세션삭제하고 리다이렉트
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;