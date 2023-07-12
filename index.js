require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dns = require('dns');
const UrlModel = require('./urlModel');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", function (req, res) {
  const url = req.body.url;

  // Regular expression pattern to validate URL format
  const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

  if (!url.match(urlPattern)) {
    res.json({ error: 'Invalid URL' });
    return;
  };

  const hostname = new URL(url).hostname;

  dns.lookup(hostname, function (err, address) {
    if (err) {
      res.json({ error: 'Invalid URL' });
    } else {
      UrlModel.findOne({ original_url: url })
        .then((foundUrl) => {
          if (foundUrl) {
            res.json({
              original_url: foundUrl.original_url,
              short_url: foundUrl.short_url
            });
          } else {
            UrlModel.countDocuments({})
              .then((count) => {
                const newUrl = new UrlModel({
                  original_url: url,
                  short_url: count + 1
                });

                return newUrl.save();
              })
              .then((savedUrl) => {
                res.json({
                  original_url: savedUrl.original_url,
                  short_url: savedUrl.short_url
                });
              })
              .catch((err) => {
                res.status(500).json({ error: "Internal Server Error, could not count" });
              })
          }
        })
        .catch((err) => {
          res.status(500).json({ error: "Internal Server Error, could not find" });
        })
    }
  });

});

app.get("/api/shorturl/:shortUrl", function (req, res) {
  const shortUrl = req.params.shortUrl;

  UrlModel.findOne({ short_url: shortUrl })
    .then((foundShortUrl) => {
      res.redirect(foundShortUrl.original_url)
    })
    .catch((err) => {
      res.status(500).json({ error: 'Could not find Url' })

    })
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
