const local = require('./localStrategy');
const {User} = require('../models');

module.exports = (passport)=>{
    //strategy(로그인) 성공시 호출된다
    //사용자 정보 객체를 세션에 아이디로 저장한다
    //id만 저장하면 세션의 용량이 커지는것을 방지할수 있다
    passport.serializeUser((user,done)=>{
        done(null,user.id);
    });
    //세션에 저장한 아이디를 통해서 사용자 정보 객체를 불러온다
    passport.deserializeUser((id,done) => {
        //세션에 저장된 id를 사용해서 db에서 조회
        //db에서 데이터를 찾으면 req.user에 저장한다
        User.findOne({where: {id}})
            .then(user => done(null,user))
            .catch(err => done(err));
    })

    local(passport);
}