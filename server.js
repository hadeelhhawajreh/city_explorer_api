// should e in every sever ...---save it
let express = require('express');
let cors = require('cors');

let app = express();
app.use(cors());//allow all devices acess to my server 
require('dotenv').config();

app.get('/location', hadleLocation);//calling function withut ()
const PORT = process.env.PORT;

function hadleLocation(request, response) {// req,res are var
    try {
        let city = request.query.city;//query par from city يعني من اللينك وين بدي اروح :()/amman or /seattle 
        let jsonData = require('./data/location.json');//file 
        let jsonOjb = jsonData[0];
        let locationObjCons = new Location(city, jsonOjb.display_name, jsonOjb.lat, jsonOjb.lon);//from file name is location.json
        response.status(200).json(locationObjCons);//converting to json and sent it 
  


}catch (error) {
    response.status(500).send('Sorry, something went wrong');
}}

// location constr
function Location(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.latitude = latitude;
    this.longitude = longitude;
}



app.listen(PORT, () => {
    console.log(`app is listening  to  ${PORT}`);
})


// Weather constr


// {
//     "search_query": "seattle",
//     "formatted_query": "Seattle, WA, USA",
//     "latitude": "47.606210",
//     "longitude": "-122.332071"
//   }

//////////////////////
// [
//     {
//       "forecast": "Partly cloudy until afternoon.",
//       "time": "Mon Jan 01 2001"
//     },
//     {
//       "forecast": "Mostly cloudy in the morning.",
//       "time": "Tue Jan 02 2001"
//     },
//     ...
//   ]
/////////////////////






// //solving wether 
// function Weather(forecast, time) {
//     this.forecast = forecast;
//     this.time = time;
// }

// app.get('/weather', hadleWeather);//calling function withut ()
// function hadleWeather(req, res) {// req,res are var
//     try {
//         let weather = req.query.city;//query par from city يعني من اللينك وين بدي اروح :()/amman or /seattle 
//         let jsonData = require('./data/weather.json');
//         let jsonOjbW = jsonData.data;
//         let weatherArray=[];
//         jsonOjbW.forEach(element => {
//             let toDate= element.datetime;
//             let temp=new Date(toDate).split('');
//             temp=new Date(temp[0],temp[1],temp[2])
//             let weatherObjCons = new Weather( element.weather.description, temp);//from file name is weather.json
//             weatherArray.push(weatherObjCons);
//         });
//         res.status(200).json(weatherObjCons);//converting to json and sent it 
//     }
//     }
//     catch (error) {
//     res.status(500).send('Sorry, something went wrong');
// }
