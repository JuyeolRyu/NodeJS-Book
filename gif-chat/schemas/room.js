const mongoose = require('mongoose');
const {Schema} = mongoose;
const roomSchema = new Schema({
    //required : true => 필수로 있어야 하는 속성
    title: {//방제목
        type: String,
        required: true,
    },
    max:{//최대 수용 인원
        type: Number,
        required: true,
        defaultValue: 10,
        min: 2,
    },
    owner:{//방장
        type: String,
        required: true,
    },
    password: String,//비밀번호
    createdAt:{//생성시간
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Room',roomSchema);