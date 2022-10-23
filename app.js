const express = require("express");
const bosyParser = require("body-parser");
const today = require(__dirname + "/date.js");

const app = express();
app.use(bosyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

let items = [];

const date = today.day();
let lastUpdateDate;
lastUpdateDate = (lastUpdateDate === null) ? date : lastUpdateDate;
if (date !== lastUpdateDate) {
    items = [];
    lastUpdateDate = date;
}

app.get('/', (req, res) => {
    res.render('todolist', { day: date, items: items });
});

app.post('/', (req, res) => {
    if (req.body.item) {
        items.push({ name: req.body.item, chk: false });
    }
    res.redirect("/");
});

app.post("/chk", (req, res) => {
    let index = Number(req.body.index);
    items[index].chk = !items[index].chk;
    // console.log(items[index]);
    res.redirect("/");
});

// app.post('/r', (req, res) => {
//     items = [];
//     res.redirect("/");
// });

app.listen(process.env.PORT || 3000, () => { console.log("server started...") });