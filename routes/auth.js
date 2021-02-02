const express = require('express');
//const passport = require('passport');
const bcrypt = require('bcrypt');
//const{isLoggedIn,isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

//회원가입 라우터 생성
router.post('join', async(req,res,next)=>{
    const {email,nick,password} = req.body;

    try{
        //기존에 해당 이메일로 가입한 사람 있는지 확인
        const exUser = await User.findOne({where:{email}});
        if(exUser){
            return res.redirect('join?error=exist');
        }

        const hash = await bcrypt.hash(password,12);
        await User.create({
            email,
            nick,
            password:hash,
        });
        return res.redirect('/');
    }catch(err){
        console.error(error);
        return next(error);
    }
})
//로그인 요청 들어옴 ==> localStategy.js 로 이동
//끝나면 passport/index.js의 serializeUser로 이동
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
      if (authError) {
        console.error(authError);
        return next(authError);
      }
      if (!user) {
        return res.redirect(`/?loginError=${info.message}`);
      }
      return req.login(user, (loginError) => {
        if (loginError) {
          console.error(loginError);
          return next(loginError);
        }
        //세션쿠키를 브라우저로 보낸다
        return res.redirect('/');
      });
    })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});


//로그아웃
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});
module.exports = router;