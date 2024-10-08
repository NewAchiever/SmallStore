import express from 'express';
import {cartItems as cartItemsRaw, products as productsRaw} from './temp-data';
import { MongoClient } from 'mongodb';
import path from 'path';

let cartItems = cartItemsRaw;
let products = productsRaw;



async function start(){

    const client = new MongoClient(`mongodb+srv://fullstackvue:fullstackvue@cluster0.vppqkub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)

    
    try{
        await client.connect();
    }
    catch(err){
        console.log(err)
    }
    const db = client.db('dsv-db');
    
    const app = express();
    app.use(express.json());

    app.use('/images', express.static(path.join(__dirname, '../assets')));

    app.use(
        express.static(path.resolve(__dirname, '../dist'),
        {maxAge: '1y', etag:false},
    ))
    
    app.get('/products', async (req, res) => {        
        const products = await db.collection('products').find({}).toArray();
        res.send(products);
    })
    
    async function populateCartIds(ids){
        return Promise.all(ids.map(id => db.collection('products').findOne({id})))
    }
    
    app.get('/users/:userId/cart', async (req, res) => {
        
        const user = await db.collection('users').findOne({ id: req.params.userId });
        const populatedCart = await populateCartIds(user?.cartItems || []);
        res.json(populatedCart);
    })
    
    
    
    app.post('/users/:userId/cart', async (req, res) => {
        const userId = req.params.userId;
        const productId = req.body.id;
    
        const existingUser =  await db.collection('users').findOne({id: userId});

        if(!existingUser){
            await db.collection('users').insertOne({id: userId, cartItems: []});
        }

        await db.collection('users').updateOne({id: userId}, {
            $addToSet: { cartItems: productId }
        });
        const user = await db.collection('users').findOne({ id: req.params.userId });
        const populatedCart = await populateCartIds(user?.cartItems || []);
        res.json(populatedCart);
    });
    
    
    app.delete('/users/:userId/cart/:productId', async (req, res) => {
        const userId = req.params.userId;
        const productId = req.params.productId;

        await db.collection('users').updateOne({id: userId}, {
            $pull: { cartItems: productId },
        });
        
        const user = await db.collection('users').findOne({ id: req.params.userId });
        const populatedCart = await populateCartIds(user?.cartItems || []);
        res.json(populatedCart);
    })
    
    app.get('/products/:productId', async (req, res) => {
        
        const productId = req.params.productId;
        const product = await db.collection('products').findOne({id:productId});
        res.json(product)
    })

    app.get('*', (req, res) =>{
        res.sendFile(path.join(__dirname, '../dist/index.html'))
    });

    const port=process.env.PORT || 8000;
    
    
    app.listen(8000, () =>{
        console.log('Server is listening at port' + port );
    });
}

start();
