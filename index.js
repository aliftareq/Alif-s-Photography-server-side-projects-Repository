const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('colors');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())


//root api
app.get('/', (req, res) => {
    res.send('alif catering service server is running')
})

app.listen(port, () => {
    console.log(`This port is running in ${port}`);
})