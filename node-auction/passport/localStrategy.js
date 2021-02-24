const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const {User} = require('../models');

//직접 로그인을 구현할때 localStartegy를 사용한다
module.exports = (passport)=>{
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        //아래 async 함수가 성공하면 done 함수가 실행된다.
    },async(email,password,done) => {
        try{
            //User테이블에서 해당 이메일로 가입된 유저가 있는지 확인
            const exUser = await User.findOne({where: {email}});
            //유저가 있을 경우
            if(exUser){
                //현재 입력한 password와 db에 저장된 db가 같은지 확인
                const result = await bcrypt.compare(password, exUser.password);
                //같을 경우
                if(result){
                    done(null,exUser);
                //비밀번호가 틀렸을 경우
                }else{
                    done(null, false, {message:'비밀번호가 일치라지 않습니다.'});
                }
            //가입되지 않았을 경우
            }else{
                done(null, false, {message:'가입되지 않은 회원입니다.'});
            }
        //에러 발생
        }catch(error){
            console.error(error);
            next(error);
        }
    }))
}