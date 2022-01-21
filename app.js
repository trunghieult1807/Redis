const axios = require("axios");
const e = require("express");
const express = require("express");
const redis = require("redis");

const app = express();
const redisClient = redis.createClient(6379); // Redis server started at port 6379
const MOCK_API = "https://jsonplaceholder.typicode.com/users/";

// trường hợp truy vấn dữ liệu qua email thông qua database

(async() => {
    console.log('before start');
  
    await redisClient.connect();
    
    console.log('after start');
  })();

app.get("/users", (req, res) => {
    const email = req.query.email;

    try {
        axios.get(`${MOCK_API}?email=${email}`).then(function (response) {
            const users = response.data;

            console.log("User successfully retrieved from the API");

            res.status(200).send(users);
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// trường hợp truy vấn dữ liệu qua email thông qua cache

const SaveGlobalsAndDoSomething = (seconds) => {
    redisClient.incr('current_cap', function(err, res) {
        console.log(res);
    });
    try
    {
        sleep(300);
    }
    finally
    {
        redisClient.decr('current_cap', function(err, res) {
            console.log(res);
        });
    }
}

app.get("/users2", async (req, res) => {
    const email = req.query.email;
    try {
        redisClient.get(email).then((data) => {
            if (data) {
                console.log("User successfully retrieved from Redis");
                res.status(200).send(JSON.parse(data));
            } else {
                axios.get(`${MOCK_API}?email=${email}`).then(function (response) {
                    const users = response.data;
                    redisClient.set(email, JSON.stringify(users));

                    console.log("User successfully retrieved from the API");

                    res.status(200).send(users);
                });
            }
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
});