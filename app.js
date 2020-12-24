//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const _ = require('lodash')
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/todoListDB', { useUnifiedTopology: true, useNewUrlParser: true })


const ItemSchema = {
  name: String
}
const Items = mongoose.model('Item', ItemSchema)
const ListSchema = {
  name: String,
  list: [ItemSchema]
}
const List = mongoose.model('List', ListSchema)
const FirstItem = new Items({
  name: 'Welcome to My TodoList Made by MeetYourDeveloper'
})
const SecondPost = new Items({
  name: 'Hit the + button to add a point and hit the check point to Delete any point'
})
const ThirdPost = new Items({
  name: 'You Can create any custom list just by adding any custom link e.g /work after the todolink'
})

const defaultdata = [FirstItem, SecondPost, ThirdPost]

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", function (req, res) {




  Items.find(function (err, response) {

    if (response.length === 0) {
      Items.insertMany([FirstItem, SecondPost, ThirdPost], {
        function(err) {
          if (err) {
            console.log(err)
          } else {
            console.log("Successfully Added");
          }
        }
      }
      )
      res.redirect('/')
    }
    res.render("list", { listTitle: "Today", newListItems: response });
    // console.log(response)
  })



});

app.post("/", function (req, res) {



  const item = req.body.newItem;
  const list = req.body.list;
  const Item = new Items({
    name: item
  })
  if (list === "Today") {

    Item.save();
    res.redirect('/')
  } else {
    List.findOne({ name: list }, function (err, foundList) {
      if (err) {
        console.log(err)
      } else {
        foundList.list.push(Item)
        foundList.save();
        res.redirect('/' + list)
      }
    })
  }



});




app.post('/delete', (req, res) => {
  const SelectedItemID = req.body.test
  const SelectedListName = req.body.ListName
  console.log(SelectedListName)

  if (SelectedListName === "Today") {

    Items.findByIdAndDelete(SelectedItemID, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Data Enter Succcesfully');

      }
    })

    res.redirect('/')


  } else {
    List.findOneAndUpdate({ name: SelectedListName }, { $pull: { list: { _id: SelectedItemID } } }, function (err, foundList) {
      if (!err) {
        res.redirect('/' + SelectedListName)
      }
    })
  }


})

app.get("/:route", function (req, res) {
  const CustomList = _.capitalize(  req.params.route)



  List.findOne({ name: CustomList }, function (err, listData) {
    if (!err) {
      if (!listData) {
        const list = new List({
          name: CustomList,
          list: defaultdata
        })
        list.save()
        res.redirect('/' + CustomList)

      } else {
        res.render('list', { listTitle: listData.name, newListItems: listData.list })
      }
    }
  })

});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
