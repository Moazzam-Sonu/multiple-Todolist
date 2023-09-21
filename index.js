import express from "express";
import bodyParser from "body-parser";
import {dirname} from 'path';
import { fileURLToPath } from "url";
import mongoose from 'mongoose';



var __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));
const port = 3000;
mongoose.connect("mongodb://localhost:27017/todoList");

const itemSchema ={
  name: String
}
const Item = mongoose.model("Item", itemSchema);

const listSchema ={
  name: String,
  items: [itemSchema]
}
const List = mongoose.model('List',listSchema);

const second = new Item({
  name: "second"
})
const third = new Item({
  name: "third"
})
const forth = new Item({
  name: "forth"
})
var defaultList = [second,third,forth];

app.get("/", (req, res)=>{
  // const day = date.getDate();

const first = new Item({
  name: "first"
})

  Item.find().then((data)=>{
    if(data.length === 0){
      first.save();
      console.log("successful Save");
      res.redirect("/");
    }else{
      res.render('list.ejs' , {listTitle: "TodayList", newListItems: data});
    }
  }).catch((err)=>{
    console.log(err);
  })
  
})

app.post("/", (req,res)=>{
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "TodayList"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}).then((data)=>{
      data.items.push(item);
      data.save();
      res.redirect(`/${listName}`);
    })
  }
})


app.get("/:customListName", (req,res)=>{
  const customLname = req.params.customListName;
  List.findOne({name: customLname}).then((foundList)=>{
    if(!foundList){
      const list =  new List({
      name: customLname,
      items: defaultList
     })
     list.save();
     res.redirect(`/${customLname}`);
    }
    else{
      res.render('list.ejs' , {listTitle: foundList.name, newListItems: foundList.items});
    }
  })

})

app.post("/delete", (req,res)=>{
  const checkBoxItem =req.body.box;
  const listName = req.body.listName;

  if(listName === "TodayList"){
  Item.findByIdAndRemove({_id:checkBoxItem}).then((data)=>{
    console.log(data)}).catch((err)=>{
      console.log(err)});
  res.redirect("/");
}else{
  List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkBoxItem}}}).then((data)=>{
    if(data)
     res.redirect(`/${listName}`);
  });
}
})
app.listen(port, ()=>{
  console.log(`your surver run on this ${port}`);
})