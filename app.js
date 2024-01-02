//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/toDoList")

const itemSchema = mongoose.Schema({
  task : String,
});

const Item = mongoose.model("Item",itemSchema)

const item1 = new Item({
  task : "welcome to to-do-list"
})

const item2 = new Item({
  task : "Hit + button to add a new item"
})

const item3 = new Item({
  task : "Hit <-- to delete the item"
})

var started = 0

const defaultItems = [item1,item2,item3]

app.get("/", function(req, res) {

  Item.find().then(function(foundItems){
    if (foundItems.length==0 && started ===0){
      started=1
      Item.insertMany(defaultItems).then(function(err){
        if (!err) {
          console.log("Items inserted successfully !")
        }
      })
    }

    res.render("list", {listTitle: "Today", newListItems: foundItems}); 
  })
});

app.post("/", function(req, res){
  const newItem = req.body.newItem
  const list=req.body.list
  const item = new Item({
    task : newItem
  })
  if (list === "Today" ){
    item.save()
    res.redirect("/")
    }else {
      Route.findOne({route : list}).then(function(found){
        found.tasks.push(item)
        found.save()
        res.redirect("/"+list)  
      })
    }
});

app.post("/delete",function(req,res){
    const deleteId = req.body.checkBox;
    const routeName =req.body.routeName
  if (routeName === "Today") {
  Item.findByIdAndDelete({_id : deleteId}).then(function(err,docs){
    console.log("Succesfully deleted the items")
    res.redirect("/")
  })
  } else {
    Route.findOneAndUpdate({route : routeName},{$pull : { tasks : {_id : deleteId}}}).then(function(found){
      if (found) {
        res.redirect("/"+routeName);
      }
    })
  }
  })

const customSchema = mongoose.Schema({
  route : String,
  tasks : [itemSchema]
})

const Route = mongoose.model("Route", customSchema)


app.get("/:customeRoute",function(req,res){
  const customeRoute = _.capitalize(req.params.customeRoute)
  Route.findOne({route : customeRoute}).then(function(found){
    if (!found){
      const rt = Route({
        route : customeRoute,
        tasks : defaultItems
      })
      rt.save()
      // res.redirect("/"+customeRoute)
      res.render("list", {listTitle: customeRoute, newListItems: defaultItems}); 
    } else {
      res.render("list", {listTitle: customeRoute, newListItems: found.tasks}); 
    }
  })
})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
