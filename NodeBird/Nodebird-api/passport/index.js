const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const {User} = require('../models');

module.exports = (passport) =>{
    //id 가지고 있는다
    //done 하는 순간 auth.js의 loginerror로 이동
    passport.serializeUser((user,done)=>{
        done(null,user.id);
    });
    //매 요청시마다 실행된다.//passport.session()이 아래 함수를 호출한다.
    //위에서 세션에 저장한 아이디를 받아서 db에서 사용자 정보 조회
    passport.deserializeUser((id,done)=>{
        User.findOne({
            where:{id},
            include:[{
                model: User,
                attributes: ['id','nick'],
                as:'Followers',
            },{
                model: User,
                attributes: ['id','nick'],
                as: 'Followings',
            }],
        })
        .then(user=>done(null,user))
        .catch(err=>done(err));
    });

    local(passport);
    kakao(passport);
}