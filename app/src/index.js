const express = require('express');
const pug = require('pug');
const app = express();
const port = 3000;

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('pasta', { message: 'Hello there!'})
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})