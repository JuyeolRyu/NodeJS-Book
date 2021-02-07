const express = require('express');
const {isLoggedIn,isNotLoggedIn} = require('./middlewares');
const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = null;
  res.locals.followerCount = 0;
  res.locals.followingCount = 0;
  res.locals.followerIdList = [];
  next();
});
//자신의 프로필은 로그인해야 볼수 있도록한다
router.get('/profile', isLoggedIn, (req, res) => {
  //isLoggedIn이 true 반환해야지 res.render가 실행된다.
  res.render('profile', { title: '내 정보 - NodeBird', user:req.user });
});

router.get('/join', isNotLoggedIn,(req, res) => {
  res.render('join', { 
    title: '회원가입 - NodeBird',
    user: req.user,
    joinError: req.flash('joinError'),
  });
});

router.get('/', (req, res, next) => {
  res.render('main', {
    title: 'NodeBird',
    twits:[],
    user: req.user,
    loginError:req.flash('loginError'),
  });
});

module.exports = router;