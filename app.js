const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const _ = require('lodash');

const config = require(__dirname + "/config.js")
const today = require(__dirname + "/date.js");
const date = today.day();
mongoose.set('strictQuery', true);

const { Schema } = mongoose;
mongoose.connect(config.url);
const itemSchema = new Schema({
    text: String,
});
const Item = mongoose.model('Item', itemSchema);
const defaultItems = [];

const Prereq = mongoose.model('Prereq',
    new Schema({ pretext: [String] }), 'prereq');
Prereq.findOne({ name: '__pretext' }, (err, preDoc) => {
    if (err) console.log(err);
    else {
        // console.log(preDoc.pretext.length);
        preDoc.pretext.forEach((ptxt) => {
            const item = new Item({
                text: ptxt,
            });
            defaultItems.push(item);
        });
    }
});

const listSchema = new Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model('List', listSchema);

//Express-Initialization
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

//Get-MainRoute
app.get('/', (req, res) => {

    List.findOne({ name: 'today' }, (err, foundList) => {
        if (err) console.log(err);
        else if (foundList) {
            res.render('todolist', { listTitle: date, items: foundList.items });
        }
        else {
            const list = new List({
                name: 'today',
                items: defaultItems
            });
            list.save();
            res.redirect('/');
        }
    });
});

//Get-CustomList
app.get('/:customList', (req, res) => {
    const listName = _.capitalize(req.params.customList);

    List.findOne({ name: listName }, (err, foundList) => {
        if (err) console.log(err);
        else if (foundList) {
            res.render('todolist', { listTitle: listName, items: foundList.items });
        }
        else {
            const list = new List({
                name: listName,
                items: defaultItems
            });
            list.save();
            res.redirect('/' + listName);
        }
    });
});

//Create Entries/Items
app.post('/', (req, res) => {
    const item = req.body.itemText;
    let listName = req.body.listName;
    // console.log(listName);
    if (listName === date) listName = 'today';
    if (item) {
        const newItem = new Item({
            text: item,
        });

        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(newItem);
            foundList.save();
            if (listName === 'today') listName = '';
            res.redirect('/' + listName);
        });
    } else {
        if (listName === 'today') listName = '';
        res.redirect('/' + listName);
    }
});

//Delete Entities
app.post("/chk", (req, res) => {
    const checkedItemID = req.body.checkbox;
    let listName = req.body.listName;
    if (listName === date) listName = 'today';

    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemID } } }, (err, foundList) => {
        if (listName === 'today') listName = '';

        if (!err) {
            res.redirect('/' + listName);
        } else console.log(err);
    });
});

app.listen(process.env.PORT || 3000, () => { console.log("server started...") });
