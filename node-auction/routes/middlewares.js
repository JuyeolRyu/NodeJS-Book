exports.isLoggedIn = (req,res,next)=>{
    //req.isAuthenticated ==> passport에서 제공하는데 로그인이 되어있는지 확인한다.
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash('loginError','로그인이 필요합니다');
        res.redirect('/');
    }
};

exports.isNotLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        next();
    }else{
        res.redirect('/');
    }
};