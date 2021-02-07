const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
/*설정파일에서 development를 불러온다.*/
const config = require('../config/config')[env];

const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
/*앞으로 생성할 속성들*/
db.User = require('./user')(sequelize,Sequelize);
db.Post = require('./post')(sequelize,Sequelize);
db.Hashtag = require('./hashtag')(sequelize,Sequelize);

//테이블간의 관계 정의
db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);

db.Post.belongsToMany(db.Hashtag,{through:'PostHashtag'});
db.Hashtag.belongsToMany(db.Post,{through:'PostHashtag'});
db.User.belongsToMany(db.User,{
  foreignKey:'followingId',
  as:'Followers',
  through:"Follow",
});
db.User.belongsToMany(db.User,{
  foreignKey:'followerId',
  as:'Followings',
  through:"Follow",
})

module.exports = db;