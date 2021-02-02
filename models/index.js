const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
/*설정파일에서 development를 불러온다.*/
const config = require('../config/config')[env];

/*앞으로 생성할 속성들*/
const User = require('./user');
const Post = require('./post');
const Hashtag = require('./hashtag');

const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;

User.init(sequelize);
Post.init(sequelize);
Hashtag.init(sequelize);

User.associate(db);
Post.associate(db);
Hashtag.associate(db);

module.exports = db;