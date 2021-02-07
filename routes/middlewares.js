exports.isLoggedIn = (req,res,next)=>{
    //로드인 되어 있는 경우
    if(req.isAuthenticated()){
        next();
    }else{
        res.status(403).send('로그인 필요');
    }
};

exports.isNotLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        next();
    }else{
        res.redirect('/');
    }
};