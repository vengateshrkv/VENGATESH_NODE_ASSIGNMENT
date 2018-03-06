var express = require("express");
var path = require("path");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use("/", require("./routes/index"));

app.listen("3000", function () { });