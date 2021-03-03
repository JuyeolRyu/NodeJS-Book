const express = require('express');
const router = express.Router();

router.get('/',(req,res,next)=>{
    try{
        res.send('ok');
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;