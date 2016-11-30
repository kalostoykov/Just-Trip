/* globals require console */
"use strict";

const config = require("./server/config");
const data = require("./server/data")(config);
const app = require("./server/config/application")({ data });
const pug = require("pug");
const fs = require("fs");
require("./server/routers")(app, data);

// TEST FOR CREATING AND FINDING
const admin = {
    username: "admin",
    password: "pass",
    email: "no@email.com",
    firstname: "no",
    lastname: "name",
    age: 14,
    country: "Bulgaria",
    city: "Sofia"
};

const tour = {
    creator: "ghost",
    title: "SPA WEEK IN TELERIK",
    city: "Sofia",
    country: "Bulgaria",
    description: "Code all day, every day!",
    price: 169,
    maxUser: 20,
    beginTourDate: Date.now(),
    endTourDate: Date.now(),
    isValid: true
};

data.getTourById("583eae635a2c10312ca443e3")
    .then(tourId => {
        console.log(tourId);
    })
    .catch(err => {
        console.log(err);
        data.createTour(tour);
    });

data.getUserByUsername(admin.username)
    .then(user => {
        console.log(user);
    })
    .catch(err => {
        console.log(err);
        data.createUser(admin);
    });

// END OF TEST

app.listen(process.env.PORT || config.port, () => {
    console.log(`Application listen on port: ${config.port}`);
});


// Testing pug
var user = {
    isLogged: true
}

let html = pug.renderFile("./views/publish-advertisement.pug", user);

fs.writeFileSync("test-pug-homepage.html", html, "utf8");
// End testing pug