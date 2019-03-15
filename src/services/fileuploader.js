var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var app = express();
var config = require('./fileUploaderConfig');
var JSZip = require('jszip');
var fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.dest)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({ storage: storage });

// TODO: This needs to be changed later to support endpoint like '/api/upload' for consistency and get it configured in nginx in all env
app.post("/upload", upload.array("uploads", 12), function (req, res) {
  var fs = require('fs');
  fs.readFile(req.files[0].path, {encoding: 'utf-8'}, function(err1,fileContent){
    if (!err1) {
      const zip = new JSZip();
      zip.file(req.files[0].originalname, fileContent);
      zip.generateAsync({type: 'nodebuffer' })
        .then(function(content) {
          fs.writeFile(config.dest + '/' + req.files[0].originalname.replace('csv', 'gz'), content, function(err) {
            if(!err)  {
              fs.unlink(req.files[0].path);
              res.send(req.files);
            } else {
              console.log('err')
              console.log(err1);
              res.send(err);
            }
          });
        });
    } else {
      console.log('err1')
      console.log(err1);
      res.send(err1);
    }
  });

});

app.get("/upload", function (req, res) {
  console.log('listening to GET Request');
});

var server = app.listen(config.port, function() {
  console.log("Listening on port %s...", server.address().port);
});
