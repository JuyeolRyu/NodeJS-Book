const express = require('express');
const Room = require('../schemas/room');
const Chat = require('../schemas/chat');

const router = express.Router();

router.get('/',async(req,res,next)=>{
    try{
        const rooms = await Room.findOne({});
        res.render('main',{rooms,title:'GIF 채팅방',error:req.flash('roomError')});
    }catch(error){
        console.error(error);
        next(error);
    }
});
router.get('/room',async(req,res,next)=>{
    res.render('room',{title:'GIF 채팅방 생성'});
});
//채팅방 만드는 라우터
router.post('/room',async(req,res,next)=>{
    try{
        const room = new Room({
            title: req.body.title,
            max: req.body.max,
            owner: req.session.color,
            password: req.body.password,
        });
        const newRoom = await room.save();
        const io = req.app.get('io');
        ///room 네임스페이스에 연결된 모든 클라이언트에게 데이터를 보내는 메서드
        io.of('/room').emit('newRoom',newRoom);
        res.redirect(`/room/${newRoom._id}?password=${req.body.password}`);
    }catch(error){
        console.error(error);
        next(error);
    }
});
//채팅방을 렌더링하는 라우터
router.get('/room/:id', async (req, res, next) => {
  try {
    const room = await Room.findOne({ _id: req.params.id });
    const io = req.app.get('io');
    //방이 있는지 확인
    if (!room) { 
      req.flash('roomError','존재하지 않는 방입니다.');
      return res.redirect('/');
    }
    if (room.password && room.password !== req.query.password) {
      req.flash('roomError','비밀번호가 틀렸습니다.');
      return res.redirect('/');
    }
    const { rooms } = io.of('/chat').adapter;
    if (rooms && rooms[req.params.id] && room.max <= rooms[req.params.id].length) {
      req.flash('roomError','허용 인원이 초과하였습니다.');
      return res.redirect('/');
    }
    return res.render('chat', {
      room,
      title: room.title,
      chats: [],
      user: req.session.color,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});
router.delete('/room/:id', async (req, res, next) => {
  try {
    await Room.remove({ _id: req.params.id });
    await Chat.remove({ room: req.params.id });
    res.send('ok');
    setTimeout(() => {
      req.app.get('io').of('/room').emit('removeRoom', req.params.id);
    }, 2000);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;