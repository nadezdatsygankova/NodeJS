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

app.engine("hbs", exphbs({
    extname: "hbs",
    defaultLayout: false,
    layoutsDir: path.join(__dirname, '/views')
}));

app.set("views", path.join(__dirname, "views"));                            //  Identifies the views subfolder (2nd parameter) as the folder containing all handlebars template files
app.set("view engine", "hbs");

app.use("/", express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



let Arr = {
    name: [],
    current: "Church",
};

rl.on('line', (line, listenerCount, byteCount) => {
    Arr.name.push(line);
})

    .on('error', (err) => {
        console.error(err);
    });


app.post('/', (req, res) => {
    let body = req.body.rdoImage;
    console.log(`Answer is ${body}`);
    Arr.current = body;
    console.log(Arr.current);
    res.redirect('/');
});



app.get('/', (req, res) => {
    console.log(Arr);
    res.locals = { data: Arr };
    res.render('viewData');
});



app.listen(HTML_PORT, (res, req) => {
    console.log(`App listening on port ${HTML_PORT}!`);
});
