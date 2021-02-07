/*
    static associate(db){
        db.Post.belongsTo(db.User);
        db.Post.belongsToMany(db.Hashtag,{through:'PostHashtag'});
    }
*/

module.exports = (sequelize,DataTypes)=>(
    sequelize.define('post',{
        content : {
            type: DataTypes.STRING(140),
            allowNull: false,
        },
        img: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
    },{
        timestamps: true,
        paranoid: true,
    })
)