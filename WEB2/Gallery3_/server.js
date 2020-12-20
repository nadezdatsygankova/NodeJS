//Author Nadezda Tsygankova
//Assignment 3
//WEB322
/*for close DB -path -/closeDB   */


const HTML_PORT = process.env.PORT || 3000;

const express = require("express");
const exphbs = require('express-handlebars');
const path = require("path");
const bodyParser = require('body-parser');
const app = express();
const { listenerCount } = require("process");
const { request } = require("http");
const session = require("client-sessions");
const randomStr = require("randomstring");
const logout = require("./logout.js");

const pur = require("./purchase.js");
let fs = require("fs");
app.engine("hbs", exphbs({
    extname: "hbs",
    defaultLayout: false,
    layoutsDir: path.join(__dirname, '/views')
}));
let rawData = fs.readFileSync("./user.json");


let user = JSON.parse(rawData); // red a file and created a object
//console.log(user);
//console.log(user["george.tsang@senecacollege.ca"]);


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use("/", express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var strRandom = randomStr.generate();
let Arr = {
    name: [],
    current: "Nature.jpg",
    description: [],
    descriptionCurrent: "",
    price: [],
    priceCurrent: "",
    status: [],
    email: "",
};


const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://tnadezda:Volgograd2015@mongodbatlas.d4tql.mongodb.net/mongodatabase?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
var Schema = mongoose.Schema;
let gallerySchema = new Schema({
    filename: String,
    description: String,
    price: String,
    status: String
}, {
    versionKey: false
});

gallerySchema.set("collection", "gallery");
let galleryProj = mongoose.model("gallery", gallerySchema)
let galleryObj = JSON.parse(fs.readFileSync("./gallery.json"))


/* for creating a db
let len = galleryObj.length;

console.log(`Number of elements in galleryObj array = ${len}`);

for (var i = 0; i < len; i++) {

    galleryProj.create({
        "filename": galleryObj[i].filename,
        "description": galleryObj[i].description,
        "price": galleryObj[i].price,
        "status": galleryObj[i].status
    }, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            console.log("Reload Complete");
        }
    });
}
*/

let name = "";

app.use(session({

    cookieName: "MySession",
    secret: strRandom,
    duration: 5 * 60 * 1000,
    activeDuration: 1 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true

}));


app.get('/', (req, res) => {
    console.log(name);
    res.locals = { data: name };
    res.render('password');

});

app.post('/', (req, res) => {
    name = "";
    let username = req.body.userName;
    console.log(`Username is ${username}`);
    let password = req.body.password;
    console.log(`Password is ${password}`);
    if (username in user) {
        console.log('true username');
        if (password === user[username]) {
            console.log('true login');

            Arr.email = username;
            req.MySession.user = Arr.email;
            res.redirect('/galleryC');
        }
        else {
            console.log('false password');
            name = "Invalid password";
            res.redirect('/');
        }
    }
    else {
        console.log('false username');
        name = "Not a registered username";
        res.redirect('/');
    }
});


app.post('/registration', (req, res) => {

    let usernameReg = req.body.acuserName;
    console.log(`UsernameRegistration is ${usernameReg}`);
    let passwordReg = req.body.acpassword;
    console.log(`Password is ${passwordReg}`);
    let passwordRegCon = req.body.confirmPassword;
    console.log(`Password is ${passwordRegCon}`);

    if (usernameReg in user) {
        name = "User exists";
        res.redirect('/');
    }
    else {
        if (passwordReg === passwordRegCon) {

            name = "Successfully registered";
            user[usernameReg] = passwordReg;
            fs.writeFile("user.json", JSON.stringify(user, null, 4), function (err) {

            });
            res.redirect('/');
        }

        else {
            name = "Passwords do not match";
            res.redirect('/registration');
        }

    }
});


app.get('/registration', (req, res) => {
    res.locals = { data: name };
    res.render('registration');
});

app.use("/logout", logout);
app.use("/purchase", pur);

// app.get('/logout', function (req, res) {
//     req.MySession.reset();
//     name = "";
//     res.redirect('/reset');
// });

app.get('/reset', function (req, res) {
    galleryProj.updateMany({}, { "status": "A" }, { multi: true }, (err, result) => {

        if (err) {
            throw err;
        } else {
            console.log(" updated all");
            res.redirect('/');
        }
    });
});


app.post('/gallery', (req, res) => {
    let body = req.body.selection;
    console.log(body);
    console.log(`Answer is ${body}`);
    if (body === "Nature.jpg") {
        Arr.current = "Nature.jpg";
        res.redirect('/gallery');
    }
    else {
        Arr.current = body;
        console.log(Arr.current);
        res.redirect('/gallery');
    }

});

app.get('/gallery', (req, res) => {
    console.log("Cookies from client in gallery:", req.MySession);
    console.log(Arr.email);
    res.locals = { data: Arr };
    if (req.MySession.user != Arr.email) {
        req.MySession.reset();
        res.redirect('/');
    }
    else {
        console.log(req.MySession.user);
        res.render('viewData');
    }
});


app.get('/galleryC', (req, res) => {

    galleryProj.find({ status: "A" }, (err, result) => {
        if (err) throw err;
        else {
            console.log("Find all students with A reload.before gallery..");
            //   console.log(result);
            Arr.current = "Nature.jpg";
            Arr.name = [],
                Arr.description = [];
            Arr.price = [];
            Arr.status = [];

            for (let index = 0; index < result.length; index++) {
                Arr.name.push(result[index].filename);
                Arr.description.push(result[index].description);
                Arr.price.push(result[index].price);
                Arr.status.push(result[index].status);
            }
            console.log("Save arr");
            res.redirect('/gallery');
        }

    });
});




app.get('/purchaseC', (req, res) => {
    let change = Arr.current;
    galleryProj.findOneAndUpdate({ filename: change }, { "status": "S" }, { new: true }, (err, result) => {

        if (err) {
            throw err;
        } else {
            console.log("with updated");
            res.redirect('/galleryC');
        }

    });

});



app.get('/purchase', (req, res) => {
    if (Arr.current === "Nature.jpg") {
        res.redirect('/gallery');
    }
    else {
        console.log(Arr.name.length);
        console.log(Arr.current);
        let findindex;
        for (let index = 0; index < Arr.name.length; index++) {
            if (Arr.name[index] === Arr.current) {
                findindex = index;
            }
        }
        Arr.descriptionCurrent = Arr.description[findindex];
        Arr.priceCurrent = Arr.price[findindex];
        console.log(Arr.descriptionCurrent);
        console.log("current");
        console.log(Arr.current);
        res.locals = { data: Arr };
        res.render('purchase');
    }

});


//for closing DB
/*
app.get('/closeDB', (req, res) => {
    mongoose.connection.close(function () {
        console.log("Mongoose connection disconnected");
    });
});
*/
app.listen(HTML_PORT, (res, req) => {
    console.log(`App listening on port ${HTML_PORT}!`);
});

