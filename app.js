const express = require('express');
const bodyParser = require('body-parser');
// require pg-promise
const pgp = require('pg-promise')();
const PORT = process.env.PORT || 3000;
const app = express();
// use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// base config file to access restaurantDB
const config = {
    host: 'localhost',
    port: '5432',
    database: 'restaurant',
    user: 'postgres',
}
// assign the config file to our DB
const db = pgp(config);

//GET ALL
app.get('/api/restaurants', (req, res) => {
    db.query('SELECT * FROM restaurant ORDER BY restaurant.id asc')
        .then(results => {
            res.json(results);
        })
        .catch((e) => {
            // handle error
            res.status(404).json({
                error: 'Database Error'
            })
        })
})

//GET by name
app.get('/api/restaurants/name/', (req, res) => {
    console.log(req.body.name);
    console.log(typeof (req.body.name))
    db.any("SELECT * FROM restaurant WHERE restaurant_name iLike '%$<name>%'", req.body.name)
        .then(results => {
            if (results) {
                res.json(results);
            } else {
                res.status(404).json({ error: 'No Results : Name' });
            }
        })
        .catch((e) => {
            res.status(500).json({
                error: 'Database Error'
            });
        })
});

//GET by rating
app.get('/api/restaurants/rating/:rating', (req, res) => {
    db.manyOrNone("SELECT * FROM restaurant WHERE rating = $1 ORDER BY id asc", req.params.rating)
        .then(results => {
            if (results) {
                res.json(results);
            } else {
                res.status(404).json({ error: 'No Results : Category' });
            }
        })
        .catch((e) => {
            res.status(500).json({
                error: 'Database Error'
            });
        })
});

//GET by distance 
app.get('/api/restaurants/distance/:distance', (req, res) => {
    db.manyOrNone("SELECT * FROM restaurant WHERE distance < $1 ORDER BY distance asc", req.params.distance)
        .then(results => {
            if (results) {
                res.json(results);
            } else {
                res.status(404).json({ error: 'No Results : Distance' });
            }
        })
        .catch((e) => {
            res.status(500).json({
                error: 'Database Error'
            });
        })
});

//GET by id
app.get('/api/restaurants/:id', (req, res) => {
    db.oneOrNone('SELECT * FROM restaurant WHERE restaurant.id = $1', req.params.id) // $1 is a sanitized number referring to req.params.id
        .then(results => {
            if (results) {
                res.json(results);
            } else {
                res.status(404).json({ error: 'No Results' });
            }
        })
        .catch((e) => {
            res.status(500).json({
                error: 'Database Error'
            });
        })
});

//POST
app.post('/api/restaurants/', (req, res) => {
    console.log(req.body);
    db.one('INSERT INTO restaurant VALUES (DEFAULT, ${name}, ${distance}, ${stars}, ${category}, ${fav_dish}, ${does_takeout}, ${visit_date}, ${address}) RETURNING *', req.body)
        .then((result) => {
            res.status(201).json(result)
        })
});

//UPDATE
app.put('/api/restaurants/:id&:distance', (req, res) => {
    console.log(req.body);
    db.result('update restaurant set distance = $1 WHERE id = $2 returning *', [req.params.distance, req.params.id])
        .then((result) => {
            res.status(201).json(result);
        })
})

//DELETE
app.delete('/api/restaurants/:id', (req, res) => {
    console.log(req.params.id);
    db.oneOrNone('delete from restaurant WHERE restaurant.id = $1 returning *', req.params.id)
        .then((result) => {
            if (result != null) {
                res.json(`Rows deleted : ${result.rowCount}`);
            } else {
                res.json({ error: 'Database error' });
            }
        })
})





app.listen(PORT, () => console.log(`running on http://localhost:${PORT}`))