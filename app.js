const express = require("express");
const bosyParser = require("body-parser");
const today = require(__dirname + "/date.js");
const mongoose = require('mongoose')
const _ = require('lodash');

let isFirst = true;

const date = today.day();


const { Schema } = mongoose;
mongoose.connect('mongodb://localhost:27017/todoeyDB');
const itemSchema = new Schema({
    text: String,
    // chk: Boolean
});
const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
    text: "Welcome to Todoey",
    // chk: false
});
const item2 = new Item({
    text: "Hit + to add new Item",
    // chk: false
});
const item3 = new Item({
    text: "<-- Hit this to delete an Item",
    // chk: false
});
const defaultItems = [item1, item2, item3];

const listSchema = new Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model('List', listSchema);


const app = express();
app.use(bosyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');


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
    // Item.find({}, (err, itemList) => {

    //     if (itemList.length === 0 && isFirst === true) {
    //         isFirst = false;
    //         Item.insertMany(defaultItems, (err) => {
    //             if (err) console.log(err)
    //             else console.log('Default Items Inserted');
    //             // res.redirect("/");
    //         });
    //     }
    //     // else {
    //     res.render('todolist', { listTitle: date, items: itemList });
    //     // }
    // });
});

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

app.post('/', (req, res) => {
    const item = req.body.itemText;
    let listName = req.body.listName;
    // console.log(listName);
    if (listName === date) listName = 'today';
    if (item) {
        const newItem = new Item({
            text: item,
            // chk: false
        });

        // if (listName === date) {
        //     newItem.save();
        //     res.redirect('/');
        // } else {
        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(newItem);
            foundList.save();
            if (listName === 'today') listName = '';
            res.redirect('/' + listName);
        });
        // }
    } else {
        if (listName === 'today') listName = '';
        res.redirect('/' + listName);
    }
});

app.post("/chk", (req, res) => {
    const checkedItemID = req.body.checkbox;
    let listName = req.body.listName;
    if (listName === date) listName = 'today';

    // if (listName === date) {
    //     Item.findByIdAndRemove(req.body.checkbox, (err) => {
    //         if (err) console.log(err)
    //         else console.log('Item Deleted');
    //     });
    //     res.redirect("/");
    // } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemID } } }, (err, foundList) => {
        if (listName === 'today') listName = '';

        if (!err) {
            res.redirect('/' + listName);
        } else console.log(err);
    });
    // }

});

// app.post('/r', (req, res) => {
//     items = [];
//     res.redirect("/");
// });

app.listen(process.env.PORT || 3000, () => { console.log("server started...") });

//TODO:
// 1) Remove error -> when all items are deleted,
// default items are again inserted.
// soln- Create a list for today like other lists (home, school)

//2) Reset Functionality