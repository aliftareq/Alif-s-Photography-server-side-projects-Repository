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

//common function for using in routes
function varifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized Access' })
    }
    const token = authHeader.split(' ')[1]
    //varifying aceess token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Invalid Token' })
        }
        req.decoded = decoded
        next()
    })
}

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
        const cursor = ServicesCollection.find(query).sort({ _id: -1 })
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
// api for all/multiple data
app.post('/service', async (req, res) => {
    try {
        const service = req.body
        const result = await ServicesCollection.insertOne(service)
        res.send(result)
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
        const result = await ReviewsCollection.insertOne({ ...review, ReviewTime: new Date() })
        res.send(result)
    }
    catch (error) {
        res.send(error.message)
    }
})
// api for get review by service-Id
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
// api for get review by email
app.get('/reviews', varifyJWT, async (req, res) => {
    const decoded = req.decoded
    if (decoded.email !== req.query.email) {
        return res.status(403).send({ message: 'unauthorized Access!!!' })
    }
    const email = req.query.email
    try {
        const cursor = ReviewsCollection.find({ ReviewerEmail: email })
        const reviews = await cursor.toArray()
        res.send(reviews)
    }
    catch (error) {
        res.send(error.message)
    }
})
//api for deleting a order
app.delete('/review/:id', varifyJWT, async (req, res) => {
    id = req.params.id
    try {
        const result = await ReviewsCollection.deleteOne({ _id: ObjectId(id) })
        res.send(result)
    }
    catch (error) {
        res.send(error.message)
    }
})
//api for get single review
app.get('/review/:id', varifyJWT, async (req, res) => {
    id = req.params.id
    try {
        const review = await ReviewsCollection.findOne({ _id: ObjectId(id) })
        res.send(review)
    }
    catch (error) {
        res.send(error.message)
    }
})
//api for updating a review
app.patch('/review/:id', varifyJWT, async (req, res) => {
    const id = req.params.id
    const reviewText = req.body.newReviewText
    try {
        const query = { _id: ObjectId(id) }
        const updateDoc = {
            $set: { ReviewText: reviewText }
        }
        const result = await ReviewsCollection.updateOne(query, updateDoc)
        res.send(result)
    } catch (error) {
        res.send(error.message)
    }
})

//api for JWT 
app.post('/jwt', async (req, res) => {
    try {
        const user = req.body
        console.log(user);
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        res.send({ token })
    }
    catch (error) {
        res.send(error.message)
    }
})

app.listen(port, () => {
    console.log(`This port is running in ${port}`);
})