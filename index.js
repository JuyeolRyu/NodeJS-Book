const container = document.getElementById('container');
const calander = document.getElementById('calander');
const movieRank = document.getElementById('movieRank');
const dateDiv = document.getElementById('date');
const yesterdayBtn = document.getElementById('yesterdayBtn');
const tomorrowBtn = document.getElementById('tomorrowBtn');

let now = new Date();
let url = 'http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=85ef7bd4e0f94ce78f0ba83e1cc343e7&targetDt=';

const getDate = (now) =>{
    now = new Date(Date.parse(now)-1000*60*60*24);

    let year = String(now.getFullYear());
    let month = String(now.getMonth()+1);
    let date = String(now.getDate());

    if(month.length === 1){
        month = "0"+ month;
    }
    if(date.length === 1){
        date = "0"+ date;
    }
    let day = year+month+date;
    dateDiv.innerHTML = day;
    
    return day
}

const changeDate = (plus)=>{
    if(plus){
        now = new Date(Date.parse(now)+1000*60*60*24);
    }else{
        now = new Date(Date.parse(now)-1000*60*60*24);
    }

    if(getDate(now) !== getDate(new Date())){
        tomorrowBtn.disabled = false;
    }else{
        tomorrowBtn.disabled = 'disabled';
    }
}

yesterdayBtn.addEventListener('click',(e)=>{
    changeDate(false);
    dateDiv.innerHTML = getDate(now);
    ajax(url)
        .then((data)=>{
            const rank = data.boxOfficeResult.dailyBoxOfficeList;
            console.log(rank);
            movieRank.innerHTML = "";
            rank.forEach(movie =>{
                const movieName = document.createElement('div');
                movieName.innerHTML = movie.movieNm;
                movieRank.appendChild(movieName);
            })
        })
});
tomorrowBtn.addEventListener('click',(e)=>{
    changeDate(true);
    dateDiv.innerHTML = getDate(now);
    ajax(url)
        .then((data)=>{
            const rank = data.boxOfficeResult.dailyBoxOfficeList;
            console.log(rank);
            movieRank.innerHTML = "";
            rank.forEach(movie =>{
                const movieName = document.createElement('div');
                movieName.innerHTML = movie.movieNm;
                movieRank.appendChild(movieName);
            })
        })
});

const ajax = (url) =>{
    return new Promise((resolve,reject)=>{
        const xhr = new XMLHttpRequest();
        xhr.open('GET',url+getDate(now)+'&repNationCd=F',true);
        xhr.onload = () =>{
            if(xhr.status == 200 || xhr.status == 201){
                resolve(JSON.parse(xhr.responseText));
            }else{
                console.error(xhr.responseText);
            }
        }
        xhr.send();
    });
}
ajax(url)
    .then((data)=>{
        const rank = data.boxOfficeResult.dailyBoxOfficeList;
        console.log(rank);
        movieRank.innerHTML = "";
        rank.forEach(movie =>{
            const movieName = document.createElement('div');
            movieName.innerHTML = movie.movieNm;
            movieRank.appendChild(movieName);
        })
    })
//window.onload = ajax(url);