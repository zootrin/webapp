const express = require('express');
const hbs = require('hbs');
const request = require('request');
const fs = require('fs');

const port = process.env.PORT || 8080;

var app = express();

var getCountry = (country, callback) => {
    console.log('Loading API https://restcountries.eu/rest/v2/name/' + encodeURIComponent(country));
    request({
        url: 'https://restcountries.eu/rest/v2/name/' + encodeURIComponent(country),
        json: true
    }, (error, response, body) => {
        if (error) {
            callback('Cannot connect to rest-countries API');
        }
        else if (body.status === 404) {
            callback('Cannot find requested country');
        }
        else {
            callback(undefined, {
                country: country,
                city: body[0].capital
            })
        }
    });
};

var getWeather = (country, capitalCity, callback) => {
    console.log('Loading API api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(capitalCity) + '&APPID=80cdf1508b99c6931c80485a690b7b3d&units=imperial');
    request({
        url: 'http://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(capitalCity) + '&APPID=80cdf1508b99c6931c80485a690b7b3d&units=imperial',
        json: true
    }, (error, response, body) => {
        if (error) {
            callback('Cannot connect to OpenWeather API');
        }
        else if (body.cod === 404) {
            callback('Cannot find requested city');
        }
        else if (body.status !== 404) {
            callback(undefined, `The weather in ${capitalCity}, capital of ${country} is ${body.main.temp} degress Fahrenheit with wind speed of ${body.wind.speed}`);
        }
    });
};

hbs.registerPartials(__dirname + '/views/partials');

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});

hbs.registerHelper('message', (text) => {
    return text.toUpperCase();
});

hbs.registerHelper('pageAuthor', (text) => {
    return text.toUpperCase();
});

app.use((request, response, next) => {
    // var time = new Date().toString();
    // //console.log(`${time}: ${request.method} ${request.url}`);
    // var log = `${time}: ${request.method} ${request.url}`;
    // fs.appendFile('server.log', log + '\n', (error) => {
    //     if (error) {
    //         console.log('Unable to log message');
    response.render('maintenance.hbs', {
        title: 'This site is down for maintenance',
        welcome: 'This site is down for maintenance',
        Author: 'Marty Maintenance'
    });
});

app.get('/', (request, response) => {
    // response.send('<h1>Hello Express!</h1>');
    response.send({
        name: 'Alasdair',
        school: [
            'BCIT',
            'SFU',
            'UBC'
        ]
    })
});

app.get('/info', (request, response) => {
    response.render('about.hbs', {
        title: 'About Page',
        welcome: 'Welcome to my info page!',
        Author: 'Johnny Info'
    });
});

app.get('/homepage', (request, response) => {
    response.render('main.hbs', {
        title: 'Main Page',
        welcome: 'Welcome to my homepage!',
        Author: 'Harry Homepage'
    });
});

var weather='';

getCountry('Canada', (errorMessage, results) => {
    if (errorMessage) {
        console.log(errorMessage);
       weather = (errorMessage)
    } else {
        getWeather(results.country, results.city, (errorMessage, results) => {
            if (errorMessage) {
                console.log(errorMessage);
                weather = (errorMessage)
            } else {
                console.log(results);
                weather = (results)
            }
        });
    }
});

app.get('/weather', (request, response) => {
    response.render('weather.hbs', {
        title: 'Weather Page',
        welcome: 'Welcome to my weather page!',
        Author: 'Wally Weather',
        weather: weather
    });

});



app.get('/404', (request, response) => {
    response.send({
        error: 'Page not found'
    })
});

app.listen(port, () => {
    console.log(`Server is up on the port ${port}`);
});

