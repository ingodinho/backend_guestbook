const express = require('express');
const fs = require('fs');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 9000;

const pathJSON = './data/entries.json';

const readJSONtoObj = (path) => {
	return new Promise((resolve, reject) => {
		fs.readFile(path, (error, data) => {
			if (error) {
				reject(err);
			} else {
				resolve(JSON.parse(data));
			}
		});
	});
};

const writeAsJson = (path,newArray) => {
  const json = JSON.stringify(newArray);
  return new Promise ((resolve, reject) => {
    fs.writeFile(path, json,(error) => {
      if(error) reject(err);
      else {
        resolve();
      }
    })
  })
}

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use((req, _, next) => {
	console.log('New Request', req.method, req.url);
	next();
});

app.get('/', (_, res) => {
	readJSONtoObj(pathJSON).then((entriesArray) => {
		res.render('home', { entriesArray });
	});
});

app.post(
	'/',
	body('firstName').isLength({ min: 3 }),
	body('lastName').isLength({ min: 3 }),
	body('mail').isEmail(),
	body('message').isLength({ min: 3 }),
	(req, res) => {
		const newEntry = req.body;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('error', { errors: errors.errors });
			return;
		}
		readJSONtoObj(pathJSON)
    .then((entryArray) => {
			entryArray.push(newEntry);
      return entryArray;
		})
    .then(newEntryArray => {
      writeAsJson(pathJSON,newEntryArray);
    })
    .then(()=> res.redirect('/'))
	}
);

app.use((_, res) => {
	res.status(404).send('Sorry, page not found. Error 404');
});

app.listen(PORT, () => console.log('Server starts listening on port', PORT));