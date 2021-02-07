module.exports = (sequelize,DataTypes)=>(
    sequelize.define('user',{
        email : {
            type: DataTypes.STRING(40),
            allowNull: true,
            unique: true,
        },
        nick: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        password:{
            type:DataTypes.STRING(100),
            allowNull:true,
        },
        provider:{//sns 로그인했을경우 provider,snsID저장
            type:DataTypes.STRING(10),
            allowNull:true,
            defaultValue: 'local',
        },
        snsId:{
            type:DataTypes.STRING(30),
            allowNull:true,
        }
    },{
        timestamps:true,
        paranoid:true,
    })    
)

/*
    static associate(db){
        db.User.hasMany(db.Post);
        db.User.belongsToMany(db.User,{
            foreignKey: 'followingId',
            as: 'Followers',
            through:'Follow',
        });
        db.User.belongsToMany(db.User,{
            foreignKey:'followerId',
            as:'Followings',
            through:'Follow',
        });
    }
*/