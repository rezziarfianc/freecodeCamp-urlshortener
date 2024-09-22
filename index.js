require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

const shortUrls = [];

const bodyParser = require('body-parser');

const isValidUrl = urlString=> {
  var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
'((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
'(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
'(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
return !!urlPattern.test(urlString);
}

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/api/shorturl',urlencodedParser, async (req, res)=> {
  const { url=null } = req.body;
  if(!url) {
    res.json({ error: 'invalid url' });
  }

  if(!isValidUrl(url)){
    res.json({ error: 'invalid url' });
  }

  const id = shortUrls.length +1;
  const findShortUrl = shortUrls.filter((shortUrl) => shortUrl.url == url);

  if(findShortUrl.length) {
    res.json({
      original_url : url,
      shortUrl : findShortUrl[0].id,
    });
    return; 
  }

  shortUrls.push({url, id: id});

  res.json({
    original_url : url,
    shortUrl : id,
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  const { id } = req.params;
  const findShortUrl = shortUrls.filter((shortUrl) => shortUrl.id == id);
  if(!findShortUrl.length) {
    res.statusCode = 404;
    res.send('Url Not Found');
    return;
  }
  res.redirect(findShortUrl[0].url);
});




app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
