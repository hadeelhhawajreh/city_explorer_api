// should e in every sever ...---save it
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
let pg = require('pg');
let app = express();

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

app.use(cors());//allow all devices acess to my server 
app.get('/location', hadleLocation);//calling function withut ()

let client = new pg.Client(DATABASE_URL);
function hadleLocation(request, response) {// req,res are var
    let city = request.query.city;//query par from city يعني من اللينك وين بدي اروح :()/amman or /seattle 
    let key = process.env.GEOCODE_API_KEY;
    let stat = 'select search_query,formatted_query,latitude,longitude from locations  where search_query=$1;';
    let value = [city];
    client.query(stat, value).then((data) => {
        if (data.rowCount > 0) {
            response.send(data.rows[0]);
        }
        else {
            superagent.get(`http://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`)
                .then((data) => {
                    let jsonOjb = data.body[0];
                    console.log(jsonOjb);
                    // let jsonData = require('./data/location.json');//file 
                    let locationObjCons = new Location(city, jsonOjb.display_name, jsonOjb.lat, jsonOjb.lon);//from file name is location.json
                    response.send(locationObjCons);
                    let insertST = 'insert into locations (search_query,formatted_query,latitude,longitude) values($1,$2,$3,$4) returning *;'
                    let arrayValu = [locationObjCons.search_query, locationObjCons.formatted_query, locationObjCons.latitude, locationObjCons.longitude];
                    client.query(insertST, arrayValu).then(data => {
                        console.log('the city inserted into database ...');
                    })

                }).catch(() => {
                    response.status(200).send('Sorry, something went wrong');
                });
        }
    });
}

// location constr
function Location(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.latitude = latitude;
    this.longitude = longitude;
}


// Weather constr

// //solving wether 
app.get('/weather', handleWeather);//calling function withut ()

function Weather(forecast, time) {
    this.forecast = forecast;
    this.time = time;
}
function handleWeather(req, res) {// req,res are var
    let key = process.env.WEATHER_API_KEY;
    let city = req.query.search_query;//query par from city يعني من اللينك وين بدي اروح :()/amman or /seattle 
    // let jsonData = require('./data/weather.json');//from where to get it 
    superagent.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}`)
        .then(data => {
            let jsonOjbW = data.body.data;
            let weatherArray = [];
            jsonOjbW.forEach(element => {
                let toDate = element.datetime;
                var options = { weekday: 'short', year: 'numeric', day: '2-digit', month: '2-digit' };
                var today = new Date(toDate);
                console.log(today.toDateString("en-US", options));
                let dateFormatted = today.toDateString("en-US", options);
                let weatherObjCons = new Weather(element.weather.description, dateFormatted);//from file name is weather.json
                weatherArray.push(weatherObjCons);
            });
            res.status(200).send(weatherArray);//converting to json and sent it 
        }).catch(() => {
            res.send('Sorry, something went wrong');
        });
}


app.get('/trails', handleTrail);

function Trail(trailObj) {
    this.name = trailObj.name;
    this.location = trailObj.location;
    this.length = trailObj.length;
    this.stars = trailObj.stars;
    this.star_votes = trailObj.starVotes;
    this.summary = trailObj.summary;
    this.trail_url = trailObj.url;
    this.conditions = trailObj.conditionStatus;
    this.condition_date = trailObj.conditionDate.slice(0, 10);;
    this.condition_time = trailObj.conditionDate.slice(11);
}

function handleTrail(req, res) {
    let key = process.env.TRAIL_API_KEY;
    let lato = req.query.latitude;
    let long = req.query.longitude;
    superagent.get(`https://www.hikingproject.com/data/get-trails?lat=${lato}&lon=${long}&maxDistance=200&key=${key}`)
        .then(data => {
            let trailsdata = data.body.trails;
            let value = trailsdata.map(element => {
                return new Trail(element);
            });
            console.log(value);
            res.status(200).json(value);//converting to json and send it 
        }).catch(() => {
            res.status(500).send('Sorry, something went wrong');
        });
}

client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`app is listening  to  ${PORT}`);
    });
}).catch(err => {
    console.log(err);
});

//https://api.themoviedb.org/3/movie/76341?api_key=<<api_key>>

// { that should user show ....
//     "title": "Sleepless in Seattle",
//     "overview": "A young boy who tries to set his dad up on a date after the death of his mother. He calls into a radio station to talk about his dad’s loneliness which soon leads the dad into meeting a Journalist Annie who flies to Seattle to write a story about the boy and his dad. Yet Annie ends up with more than just a story in this popular romantic comedy.",
//     "average_votes": "6.60",
//     "total_votes": "881",
//     "image_url": "https://image.tmdb.org/t/p/w500/afkYP15OeUOD0tFEmj6VvejuOcz.jpg",
//     "popularity": "8.2340",
//     "released_on": "1993-06-24"
// 
app.get('/movies', movieHandle)

function Movie(movieObj) {
    this.title = movieObj.titlel;
    this.overview = movieObj.overview;
    this.average_votes = movieObj.vote_average;
    this.total_votes = movieObj.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500${movieObj.poster_path}`;
    this.popularity = movieObj.popularity;
    this.released_on = movieObj.release_date;
}
//

function movieHandle(req, res) {
    let key = process.env.MOVIE_API_KEY;
    // let city=req.query.search_query;
    superagent.get(`https://api.themoviedb.org/4/search/movie?api_key=${key}&query=${req.query.search_query}`)
        .then(data => {
            let dataMovie = data.body.results;
            console.log(dataMovie);
            let arr = dataMovie.map(element => {
                return new Movie(element);
                console.log(arr);
            });
            res.status(200).json(arr);
        }).catch(err => {
            res.status(500).send(' sorry ,some error occured', err);
        })
}
/**
 
 "name": "Pike Place Chowder",
   "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/ijju-wYoRAxWjHPTCxyQGQ/o.jpg",
   "price": "$$   ",
   "rating": "4.5",
   "url":"https://www.yelp.com/biz/pike-place-chowder-seattle?adjust_creative=uK0rfzqjBmWNj6-d3ujNVA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=uK0rfzqjBmWNj6-d3ujNVA"
 },
 */
app.get('/yelp', yelpHandle);

function Yelp(yelbOBJ) {
    this.name = yelbOBJ.name;
    this.image_url = yelbOBJ.image_url;
    this.price = yelbOBJ.price;
    this.rating = yelbOBJ.rating;
    this.url = yelbOBJ.url;

}

function yelpHandle(req, res) {
    let YELP_API_KEY = process.env.YELP_API_KEY;
    let page = req.query.page;
    let pagNum = 5;
    let beginnigPage = (page - 1) * pagNum + 1;

    let paramObj = {
        term: 'restaurants', location: req.query.search_query, limit: 5, offset: beginnigPage

    };
    superagent.get(`https://api.yelp.com/v3/businesses/search`).query(paramObj)
        .set('Authorization', `Bearer ${YELP_API_KEY}`)
        .then(data => {
            let yelpData = data.body.businesses;
            let arr = yelpData.map(element => {
                console.log(element);
                return new Yelp(element);
            });
            res.status(200).json(arr);
        }).catch(err => {
            res.status(500).send(err);

        })

}
