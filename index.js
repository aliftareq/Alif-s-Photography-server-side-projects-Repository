const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
const ReviewsCollection = client.db('alifPhotography').collection('Reviews')

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
//api for get one single services data
app.get('/services/:id', async (req, res) => {
    try {
        const id = req.params.id
        const service = await ServicesCollection.findOne({ _id: ObjectId(id) })
        res.send(service)
    }
    catch (error) {
        res.send(error.message)
    }
})

// api for post review
app.post('/review', async (req, res) => {
    try {
        const review = req.body
        // const newReview = { ...review, ReviewTime: new Date() }
        // console.log(newReview);
        const result = await ReviewsCollection.insertOne({ ...review, ReviewTime: new Date() })
        res.send(result)
    }
    catch (error) {
        res.send(error.message)
    }
})
// api for get review.
app.get('/services/reviews/:id', async (req, res) => {
    try {
        const id = req.params.id
        const cursor = ReviewsCollection.find({ ServiceId: id }).sort({ ReviewTime: -1 })
        const reviews = await cursor.toArray()
        res.send(reviews)

    }
    catch (error) {
        res.send(error.message)
    }
})

app.listen(port, () => {
    console.log(`This port is running in ${port}`);
})