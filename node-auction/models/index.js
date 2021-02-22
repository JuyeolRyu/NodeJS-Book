const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

//접속하려는 데이터베이스 이름,유저이름,비밀번호를 가져온다.
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.Sequelize = Sequeluze;
db.User = require('./user')(sequelize,Sequelize);
db.Good = require('./good')(sequelzie,Sequelize);
db.Auction = require('./auction')(sequelize,Sequelize);

//상품과 판매자,구매자 사이의 관계 정의 
//각각 ownerId, soldId 컬럼으로 추가된다
db.Good.belongsTo(db.User, {as: "owner"});
db.Good.belongsTo(db.User, {as: "sold"});
//옥션(경매)와 사림,물건 사이의 관계 정의
db.User.hasMany(db.Auction);
db.Good.hasMany(db.Auction);
db.Auction.belongsTo(db.User);
db.Auction.belongsTo(db.Good);

module.exports = db;