/* globals module require */
"use strict";

module.exports = function({ data, io }) {
    const validator = require("../../utils/validator");
    return {
        get(req, res) {

            if (!req.user) {
                res.status(401)
                    .render("not-login");
            } else {
                Promise.all([data.getAllCountries("name"), data.getAllCities("name")])
                    .then(([countries, cities]) => {
                        const user= {
                                isLogged: !!req.user
                            }

                        res.status(200)
                            .render("publish-travel", { user, countries, cities });
                    });
            }
        },
        createTour(req, res) {

            if (!req.user) {
                return res.status(401)
                    .render("not-login");
            }

            const fixDay = 1;
            let endJoinDate = new Date(`${req.body.endJoinDate}`);
            endJoinDate.setDate(endJoinDate.getDate() + fixDay);
            req.body.endJoinDate = endJoinDate;

            let beginTourDate = new Date(`${req.body.beginTourDate}`);
            beginTourDate.setDate(beginTourDate.getDate() + fixDay);
            req.body.beginTourDate = beginTourDate;

            let endTourDate = new Date(`${req.body.endTourDate}`);
            endTourDate.setDate(endTourDate.getDate() + fixDay);
            req.body.endTourDate = endTourDate;

            // TODO: ajax! ==> TO UGLY!
            if (!validator.validateString(req.body.headline, 1)) {
                res.status(400).send("Headline is required!");
            } else if (!validator.validateString(req.body.country, 1)) {
                res.status(400).send("Country is required!");
            } else if (!validator.validateString(req.body.city, 1)) {
                res.status(400).send("City is required!");
            } else if (!validator.validateString(req.user.username, 1)) {
                res.status(400).send("You must be loged in to publish!");
            } else {
                // TO DO: IT IS NOT CORRECT
                const user = req.user.username;
                const toursDetails = {
                    headline: validator.escapeHtml(req.body.headline),
                    country: validator.escapeHtml(req.body.country),
                    city: validator.escapeHtml(req.body.city),
                    endJoinDate:endTourDate,
                    beginTourDate: beginTourDate,
                    endTourDate: endTourDate,
                    maxUser: req.body.maxUser,
                    price : req.body.price,
                    description: validator.escapeHtml(req.body.description),
                    creator: validator.escapeHtml(user),
                    isValid: "true",
                    isDeleted: "false"
                };
                data.createTour(toursDetails)
                    .then(tour => {
                        const userTourData = {
                            userOfferTours: {
                                tourId: tour.getId,
                                tourTitle: tour.headline,
                                tourCountry: tour.country,
                                tourCity: tour.city
                            }
                        };
                        return data.updateUserProperty(user, userTourData);
                    })
                    .then(({ updatedUser, tour }) => {
                        io.sockets.emit('newTour', {
                            headline: `${toursDetails.headline}`,
                            country: `${toursDetails.country}`,
                            city: `${toursDetails.city}`,
                            date: `${toursDetails.beginTourDate}`,
                            tourId: `${tour.tourId}`,
                            creator: `${user}`
                        });
                        res.status(200)
                            .json(updatedUser);
                    })
                    .catch(err => {
                        console.log(`TOUR ${err} CANT BE CREATED`);
                        res.status(404)
                            .send(`TOUR ${err} CANT BE CREATED`);
                    });
            }
        },
        // UNDERCONSTRUCTION!!
        removeTour(req, res) {
            if (!req.user) {
                return res.status(401)
                    .render("not-login");
            }

            console.log(req.params.id);
            data.getTourById(req.params.id)
                .then(tour => {
                    console.log("REQESTER ====> " + req.user.username);
                    console.log("CREATOR =====> " + tour.creator);
                    if (req.user.username !== tour.creator) {
                        res.send("NOT AUTHORIZED");
                    }
                    // const id = mongoose.Types.ObjectId("5842aa4fb6d4ef10c084ad13")
                    // const searchParams = {
                    //     userBoughtTours: {
                    //         $elemMatch : {tourId : "5843635aafee9f159cf37849"}
                    //     }
                    // };

                    // return data.getUsersBySpecificCriteria(searchParams);

                    return data.getSearchResults({ userBoughtTours: { $elemMatch: { tourId: "5843635aafee9f159cf37849" } } });
                })
                .then(users => {
                    // user.forEach(x=> {
                    //     x.userBoughtTours[]isDeleted = "true";
                    // })
                    users.forEach(x => {
                        x.userBoughtTours.forEach(tour => {
                            if(tour.tourId == "5843635aafee9f159cf37849") {
                                x.isDeleted = "true";
                            }
                        })
                    });
                    // const newUsers = users.filter(x => x.userBoughtTours["tourId"] === `${req.params.id}` )
                    console.log("FIRST ===>" + users);
                    // console.log("RESULTS ====>" + newUsers);
                    //res.send(users);
                    Promise.all(users.forEach(user => data.updateUser(user))).then(result => {
                        
                    })
                })
                .then(result => {
                    res.send(result)
                })
                .catch(err => {
                    console.log("ERROOOOR =====>" + err);
                    res.send(err);
                });
        }
    };
};