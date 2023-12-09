require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const https = require('https');
const app = express();
const mailchimp = require("@mailchimp/mailchimp_marketing");

app.use(express.static("public"));

mailchimp.setConfig({
    apiKey: process.env.mailchimp,
    server: "us14",
});

app.use(bodyParser.urlencoded({ extended: true }));

async function run() {
    const response = await mailchimp.ping.get();
    console.log(response.s, response);
}

run();

app.get('/', function (req, res) {
    console.log("Server Started");
    res.sendFile(__dirname + '/signup.html');
});

app.post("/", function (req, res) {
    console.log("Post request Received");
    const FirstName = req.body.FirstName;
    const LastName = req.body.LastName;
    const Email = req.body.Email;
    var data = {
        members: [
            {
                email_address: Email,
                status: "subscribed",
                merge_fields: {
                    FNAME: FirstName,
                    LNAME: LastName,
                },
            },
        ],
    };

    var jsonData = JSON.stringify(data);
    const url = "https://us14.api.mailchimp.com/3.0/lists/130585658a";
    const options = {
        method: "POST",
        auth: `Dashrath:${process.env.mailchimp}`,
    };
    const request = https.request(url, options, function (response) {
        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/sucess.html");
        } else {
            res.sendFile(__dirname + "/failure.html");
        }
        response.on("data", function (data) {
            console.log(JSON.parse(data));
        });
    });
    request.write(jsonData);
    request.end();
});

app.post("/failure", function (req, res) {
    console.log("Received");
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Server Started listening on port 3000");
});
