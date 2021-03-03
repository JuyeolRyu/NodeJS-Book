const express = require('express');
const util = require('util');
const googleMaps = require('@google/maps');

const History = require('../schemas/history');
const Favorite = require('../schemas/favorite');
const { error } = require('console');
const router = express.Router();

//@google/maps 패키지로부터 구글지도 클라이언트 생성하는 방법
//생성된 클라이언트에는 places, placesQueryAutoComplete, placeNearBy 등의 메소드가 있다.
const googleMapsClient = googleMaps.createClient({
    key: process.env.PLACES_API_KEY,
});

router.get('/', async (req,res,next)=>{
    try{
        const favorites = await Favorite.find({});
        res.render('index', {results: favorites});
    }catch(err){
        console.error(err);
        next(err);
    }
    
});

router.get('/autocomplete/:query', (req,res,next)=>{
    //검색어 자동완성 메소드
    googleMapsClient.placesQueryAutoComplete({
        input: req.params.query,
        language: 'ko',
    },(err,response)=>{
        if(err){
            return next(err);
        }
        return res.json(response.json.prediction);
    })
});
//장소 검색시 결과값을 반환하는 라우터
router.get('/search/:query',async(req,res,next)=>{
    //구글 지도 클라이언트는 콜백 방식
    //몽구스 프로미스와 같이 사용하기 위해 프로미스 패턴으로 바꾸어준다.
    const googlePlaces = util.promisify(googleMapsClient.places);
    const googlePlacesNearby = util.promisify(googleMapsClient.placesNearby);
    //경도와 위도
    const {lat,lng,type} = req.query;
    try{
        //검색내역을 미리 DB에 저장한다.
        const history = new History({query: req.params.query});
        await history.save();
        let response;

        if (lat && lng){
            //keyword = 찾을 검색어, location:경도위도, rankby:정렬가준
            //rankby 대신 radius: 반경 으로 옵션을 넣어주면 인기순으로 정렬된다.
            response = await googlePlacesNearby({
                keyword: req.params.query,
                location: `${lat},${lng}`,
                radius: 5000,
                language:'ko',
                type,
            });
        }else{
            response = await googlePlaces({
                query: req.params.query,
                language: 'ko',
                type,
            });
        }

        //검색 결과는 response.json.results 에 담겨 있다.
        res.render('result',{
            title:`${req.params.query} 검색 결과`,
            results: response.json.results,
            query: req.params.query,
        });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/location/:id/favorite',async (req,res,next)=>{
    try{
        const favorite = await Favorite.create({
            placeId: req.params.id,
            name: req.body.name,
            location: [req.body.lng, req.body.lat],
        });
        res.send(favorite);
    }catch(err){
        console.error(err);
        next(err);
    }
})
module.exports = router;
