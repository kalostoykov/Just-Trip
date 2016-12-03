module.exports = function(models) {
    const { City } = models;

    return {
        createCity(cityObj) {
            return new Promise((resolve, reject) => {
                console.log("CREATING/UPDATING CITY...");
                City.findOne({ name: cityObj.name }, function(err, city) {
                    if (!err) {
                        if (!city) {
                            city = City.getCity(cityObj);
                        } else {
                            city.name = cityObj.name;
                            city.description = cityObj.description;
                            city.cityUrl = cityObj.cityUrl;
                            city.pictureUrl = cityObj.pictureUrl;
                            city.country = cityObj.country;
                        }
                        city.save(function(err) {
                            if (err) {
                                console.log("CANNOT CREATE City");
                                return reject(err);
                            }
                            console.log("CITY CREATED!");
                            return resolve(city);
                        });
                    }
                });
            });
        },
        getCityByName(cityName) {
            return new Promise((resolve, reject) => {

                console.log(`SEARCHING FOR CITY WITH NAME:${cityName}`);

                City.findOne({ name: cityName }, (err, city) => {
                    if (err) {
                        console.log("ERROR WHILE CONNECTING TO THE SERVER");
                        return reject(err);
                    }

                    if (!city) {
                        console.log(`CITY WITH ${cityName} WAS NOT FOUND`);
                        return reject(cityName);
                    }

                    console.log(`CITY WITH ${cityName} WAS FOUND`);
                    return resolve(city);
                });
            });
        },       
    };
};