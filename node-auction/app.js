const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const dotenv = require('dotenv');
dotenv.config();

//라우터 불러오기
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
//db와 passport 불러오기
const {sequelize} = require('./models');
const passportConfig = require('./passport');
const sse = require('./sse');
const websocket = require('./socket');
const checkAuction = require('./checkAuction');

const app = express();
//sequelize가 초기화 될 때 db에 필요한 테이블을 생성한다.
sequelize.sync();
//로그인을 위한 passport 가져옴
passportConfig(passport);
checkAuction();
//세션 설정
const sessionMiddleware = session({
    resave:false,
    saveUninitialized: false,
    secret: process.env.COOKIE_PARSER,
    cookie:{
        httpOnly: true,
        secure: false,
    },
});

app.set('views', path.join(__dirname,'views'));
app.set('view engine','pug');
app.set('port',process.env.PORT || 8010);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,'public')));
app.use('/img',express.static(path.join(__dirname,'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/',indexRouter);
app.use('/auth',authRouter);

app.use((req,res,next)=>{
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err,req,res,next)=>{
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err: {};
    res.status(err.status || 500);
    res.render('error');
});

const server = app.listen(app.get('port'), ()=>{
    console.log(app.get('port'),'번 포트에서 대기 중');
});
websocket(server,app);
sse(server);