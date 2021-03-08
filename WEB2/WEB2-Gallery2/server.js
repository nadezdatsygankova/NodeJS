//Author Nadezda Tsygankova



const HTML_PORT = process.env.PORT || 3000;

const express = require("express");
const exphbs = require('express-handlebars');
const path = require("path");
const bodyParser = require('body-parser');
const app = express();
const readline = require('linebyline');
const { listenerCount } = require("process");
const { request } = require("http");
const rl = readline('./imageslist.txt');

let fs = require("fs");

app.engine("hbs", exphbs({
    extname: "hbs",
    defaultLayout: false,
    layoutsDir: path.join(__dirname, '/views')
}));

let rawData = fs.readFileSync("./user.json");

let user = JSON.parse(rawData); // red a file and created a object
console.log(user);
console.log(user["george.tsang@senecacollege.ca"]);
console.log(user);
/*print object user 
for (let key in user) {
    console.log(key);
    console.log(user[key]);
}
//*************************** */

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use("/", express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


let Arr = {
    name: [],
    current: "Nature",
    email: "",
};

//let users = [];

rl.on('line', (line, listenerCount, byteCount) => {
    Arr.name.push(line);
})

    .on('error', (err) => {
        console.error(err);
    });

let name = "";

app.post('/', (req, res) => {

    let username = req.body.userName;
    console.log(`Username is ${username}`);
    let password = req.body.password;
    console.log(`Password is ${password}`);
    //  res.redirect('/');

    if (username in user) {
        console.log('true username');

        if (password === user[username]) {
            console.log('true login');

            Arr.email = username;
            res.redirect('gallery');
        }
        else {
            console.log('false password');
            name = "Not valid password"

        }
    }
    else {
        console.log('false username');
        name = "Not valid username";
    }


});

app.get('/', (req, res) => {
    console.log(name);
    res.locals = { data: name };
    res.render('password');
});





app.post('/gallery', (req, res) => {
    let body = req.body.rdoImage;
    console.log(`Answer is ${body}`);
    Arr.current = body;
    console.log(Arr.current);
    res.redirect('/gallery');
});



app.get('/gallery', (req, res) => {
    console.log(Arr);
    res.locals = { data: Arr };
    res.render('viewData');
});



app.listen(HTML_PORT, (res, req) => {
    console.log(`App listening on port ${HTML_PORT}!`);
});
