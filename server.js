const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('cross-fetch/polyfill');

const app = express();
const host = '127.0.0.1';
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const API_KEY = "6435f460-b77e-11e8-bf0e-e9322ccde4db";

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// initialize array in which to store comments for all artworks
let comments = [];

// retrieve only comments with the correct id for the selected object from the 'comments' array
function extractComments(comments, id) {
    let matchedComments = comments.filter(function(comment) {
        return comment.objectid == id;
    })
    return matchedComments;
};

// following form submission, add JSON object containing the comment and the current artwork's ID to 'comments' array
app.post('/', function(req, res) {
  let objectid = req.headers.referer.split('object/')[1];
  console.log(objectid);
  comments.push({"objectid" : objectid, "comment" : req.body.comments});
  console.log(comments);
  res.redirect('back');
  });

// behavior for the index route
app.get('/', (req, res) => {
  const url = `https://api.harvardartmuseums.org/gallery?size=100&apikey=${API_KEY}`;
  fetch(url)
  .then(response => response.json())
  .then(data => {
    res.render('index', {galleries: data.records});
  });
});

// behavior for the individual gallery route
app.get('/gallery/:gallery_id', function(req, res) {
    fetch(`https://api.harvardartmuseums.org/object?size=100&apikey=${API_KEY}&gallery=${req.params.gallery_id}`)
        .then(response => response.json())
        .then(data => {
          res.render('gallery', {objects: data.records})
})});

// behavior for the individual object route
app.get('/object/:object_id', function(req, res) {
    let objectcomments = extractComments(comments, req.params.object_id);
    fetch(`https://api.harvardartmuseums.org/object/${req.params.object_id}?size=100&apikey=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            res.render('object', {item: data, comments: objectcomments})
})});

app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}/`);
});
