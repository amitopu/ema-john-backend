import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import "dotenv/config";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// connecting to databse
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.i9jpv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

// using database
const run = async () => {
    try {
        await client.connect();
        const database = client.db("emaJohn");
        const productsCollection = database.collection("products");
        console.log("DB connected");

        // adding products to database
        // app.post("/products", async (req, res) => {
        //     const products_list = req.body;
        // });

        // getting products from database
        app.get("/products", async (req, res) => {
            console.log("query: ", req.query);
            const size = parseInt(req.query.size);
            const page = parseInt(req.query.page);
            const query = {};
            const cursor = productsCollection.find(query);
            let products;
            if (page || size) {
                products = await cursor
                    .skip(page * size)
                    .limit(size)
                    .toArray();
            } else {
                products = await cursor.toArray();
            }

            res.send(products);
        });

        // finding the number of product
        app.get("/productcount", async (req, res) => {
            const count = await productsCollection.countDocuments();
            res.send({ count });
        });

        // use post to get products by keys
        app.post("/productsByKeys", async (req, res) => {
            const keys = req.body;
            const ids = keys.map((key) => ObjectId(key));
            const query = { _id: { $in: ids } };
            const products = await productsCollection.find(query).toArray();
            console.log(keys);
            res.send(products);
        });
    } finally {
    }
};

// running the function connected with db
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello to node server");
});

app.listen(port, () => {
    console.log("Listening to port ", port);
});
