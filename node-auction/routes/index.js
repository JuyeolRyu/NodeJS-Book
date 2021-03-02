const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');

const {Good,Auction,User,sequelize} = require('../models');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

const router = express.Router();

router.use((req,res,next)=>{
    res.locals.user = req.user;
    next();
});

router.get('/',async (req,res,next)=>{
    try{
        const goods = await Good.findAll({where : {soldId:null}});
        res.render('main',{
            title:'NodeAuction',
            goods,
            loginError: req.flash('loginError'),
        });
    }catch(error){
        console.error(error);
        next(error);
    }
});

router.get('/join', isNotLoggedIn, async (req,res,next)=>{
    res.render('join',{
        title: '회원가입 - NodeAuction',
        joinError: req.flash('joinError'),
    });
});

router.get('/good',isLoggedIn, async (req,res)=>{
    res.render('good',{
        title: '상품 등록 - NodeAuction',
    });
});

fs.readdir('uploads',(error)=>{
    if(error){
        console.error('uploads 폴더가 없어서 uploads 폴더를 생성합니다.');
        fs.mkdirSync('uploads');
    }
});

const upload = multer({
    storage: multer.diskStorage({
        destination(req,file,cb){
            cb(null,'uploads/');
        },
        filename(req,file,cb){
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname,ext) + new Date().valueOf()+ext);
        },
    }),
    limits: {fileSize: 5*1024*1024},
});

router.post('/good',isLoggedIn,upload.single('img'), async (req,res,next)=>{
    try{
        const {name,price} = req.body;
        const good = await Good.create({
            ownerId: req.user.id,
            name,
            img:req.file.filename,
            price,
        })
        const end = new Date();
        end.setDate(end.getDate()+1);//하루뒤
        //일정을 예약한다. (실행시각, 해당시간되었을때 콜백함수)
        schedule.scheduleJob(end,async()=>{
            const success = await Auction.findOne({
                where: {goodId: good.id},
                order: [['bid','DESC']],
            });
            await Good.update(
                {soldId: success.userId},
                {where:{id:good.id}},
            );
            await User.update(
                //컬럼 : sequelize.literal(컬럼-숫자) ==> 시퀄라이즈에서 해당 숫자 줄이는 방법
                {money: sequelize.literal(`money-${success.bid}`)},
                {where:{id:success.userId}},
            );
        });
        
        res.redirect('/');
    }catch(error){
        console.error(error);
        next(error);
    }
});

router.get('/good/:id',isLoggedIn, async(req,res,next)=>{
    try{
        const [good,auction] = await Promise.all([
            Good.findOne({
                where: {id: req.params.id},
                include:{
                    model: User,
                    as:'owner',
                },
            }),
            Auction.findAll({
                where:{goodId: req.params.id},
                include:{model: User},
                order:[['bid','ASC']],
            }),
        ]);
        console.log(good);
        res.render('auction', {
            title: `${good.name} - NodeAuction`,
            good,
            auction,
            auctionError: req.flash('auctionError'),
        });
    }catch(err){
        console.error(err);
        next(err);
    }
})

router.post('/good/:id/bid',isLoggedIn, async(req,res,next)=>{
    try{
        const {bid,msg} = req.body;
        const good = await Good.findOne({
            where:{id: req.params.id},
            include:{model: Auction},
            order: [[{model:Auction}, 'bid','DESC']],
        });
        //시작가격보다 낮게 입찰하면
        if(good.price > bid){
            return res.status(403).send('시작 가격보다 높게 입찰해야합니다.');
        }
        //경매 시간이 지났으면
        if( new Date(good.createAt).valueOf()+(24*60*60*1000) < new Date()){
            return res.status(403).send('경매가 이미 종료되었습니다.');
        }
        //직전입찰가와 현재 입찰가 비교
        if(good.auctions[0] && good.auctions[0].bid >= bid){
            return res.status(403).send('이전 입찰가보다 높아야 합니다.');
        }

        const result = await Auction.create({
            bid,
            msg,
            userId:req.user.id,
            goodId:req.params.id,
        });
        req.app.get('io').to(req.params.id).emit('bid',{
            bid: result.bid,
            msg: result.msg,
            nick: req.user.nick,
        });
        return res.send('ok');
    }catch(err){
        console.error(err);
        return next(err);
    }
});

router.get('/list',isLoggedIn, async(req,res,next)=>{
    try{
        const goods = await Good.findAll({
            where: {soldId: req.user.id},
            include: {model: Auction},
            order:[[{nodel:Auction},'bid','DESC']],
        });
        res.render('list',{title:'낙찰 목록 - NodeAuction',goods});
    }catch(err){
        console.error(err);
        next(err);
    }
})
module.exports = router;