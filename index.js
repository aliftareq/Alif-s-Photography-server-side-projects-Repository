const { MongoClient, ServerApiVersion } = require('mongodb');
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


//uri and client
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.preca8g.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//connecting operation with database.
async function run() {
    try {
        await client.connect()
        console.log('Database connected'.yellow.bold);
    }
    catch (error) {
        console.log(error.message.red.bold);
    }
}
run().catch(err => console.log(err))

//here the collection
const ServicesCollection = client.db('alifPhotography').collection('Services')

//endsPoints 

//root api
app.get('/', (req, res) => {
    res.send('alif catering service server is running')
})

// api for all/multiple data
app.get('/services', async (req, res) => {
    try {
        const query = {}
        const cursor = ServicesCollection.find(query)
        const value = req.query.route
        if (value) {
            const services = await cursor.limit(3).toArray()
            res.send(services)
        }
        else {
            const services = await cursor.toArray()
            res.send(services)
        }
    }
    catch (error) {
        res.send(error.message)
    }
})

app.listen(port, () => {
    console.log(`This port is running in ${port}`);
})