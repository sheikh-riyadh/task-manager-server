const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

/* Middleware */
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wjboujk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        const taskCollection = client.db("task_manager").collection("task");
        const completedTask = client.db("task_manager").collection("completedTask")

        /* Insert task here */
        app.post('/add-task', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task)
            res.send(result)

        })

        app.get('/completed', async (req, res) => {
            const query = { isCompleted: true }
            const result = await taskCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/all-task', async (req, res) => {
            const query = {}
            const result = await taskCollection.find(query).toArray()
            res.send(result)
        })
        app.put('/comment', async (req, res) => {
            const comment = req.body;
            const filter = { _id: ObjectId(comment.id) };
            const options = { upsert: true };
            const updateDoc = {
                $push: {
                    comments: comment.userComment
                },
            };
            const result = await taskCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.put('/incomplete/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    isCompleted: false
                },
            };
            const result = await taskCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })
        /* Get all task here */
        app.get('/my-task', async (req, res) => {
            const query = { isCompleted: false }
            const result = await taskCollection.find(query).toArray();
            res.send(result)
        })

        /* Get task here */
        app.get('/my-task/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await taskCollection.findOne(query);
            res.send(result)
        })

        /* Completed task here */
        app.put('/my-task/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    isCompleted: true
                },
            };
            const result = await taskCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.put('/update-task', async (req, res) => {
            const updatedTask = req.body;
            const filter = { _id: ObjectId(updatedTask?.id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    task: updatedTask?.task,
                    imageURL: updatedTask.imageURL,
                },
            };
            const result = await taskCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        /* Delete task here */
        app.delete('/my-task/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await taskCollection.deleteOne(query);
            res.send(result)
        })
    } finally {

    }
}

run().catch(e => console.log(e))

app.get('/', (req, res) => {
    res.send("Hey developers i am calling from task manager server")
})

app.listen(port, () => {
    console.log(`Server running on ${port} port`)
})