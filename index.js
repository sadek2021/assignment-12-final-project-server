const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d9psq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('timekeeper');
        const productCollection = database.collection('products');
        const destinationCollection = database.collection('destinations');
        const orderCollection = database.collection('orders');
        // const userCollection = database.collection('users')

        // Get product API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({})
            const products = await cursor.toArray();
            res.send(products);
        })

        // Get user API
        // app.get('/users', async (req, res) => {
        //     const cursor = userCollection.find({})
        //     const users = await cursor.toArray();
        //     res.send(users);
        // })

        // Post API
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('hit the post api', product)

            const result = await productCollection.insertOne(product);
            console.log(result);
            res.json(result)

        })

        // Post order API
        app.post('/orders', async (req, res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

        // Delete orders API
        app.delete('/orders/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })

        // Status Update API
        app.put('/orders/:id', async(req, res)=>{
            const id = req.params.id;
            const updatedStatus = req.body;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updateDoc = {
                $set: {
                    status: updatedStatus.status
                }
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            console.log('update', req.body);
            res.json(result)
        })

        // Get products API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        })

        // Get order API
        app.get('/orders', async(req, res) =>{
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders)
        })

        // Get Destination API
        app.get('/destinations', async(req, res)=>{
            const cursor = destinationCollection.find({});
            const destinations = await cursor.toArray();
            res.json(destinations)
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Timekeeper server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port)
})