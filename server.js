const express = require('express');
const bodyParser= require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()
//connection string changed
const connectionString = process.env.DB_STRING


MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('scheduled-appts')
    const apptCollection = db.collection('appointments')

    
    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(express.static('public'))
    app.use(bodyParser.json())

    app.get('/', (req, res) => { 
        apptCollection.find().toArray()
             .then(results => {
                 console.log(results)
                 res.render('index.ejs', { appointments: results })
               })
             .catch(error => console.error(error))

        
      })
    app.post('/appointments', (req, res) => {
        apptCollection.insertOne({
            name: req.body.name,
            email: req.body.email,
          })
         .then(result => {
                console.log(result)
                res.redirect('/')
            })
         .catch(error => console.error(error))
      })
    app.put('/appointments', (req, res) => {
        apptCollection.findOneAndUpdate(
            { name: 'CANCELED' },
            {
              $set: {
                name: req.body.name,
                email: req.body.email,
              }
            },
            {
              upsert: true
            }
          )
            .then(result => { 
                console.log(result)
                res.json('Success')
            })
            .catch(error => console.error(error))
      })
    
    app.delete('/appointments', (req, res) => {
        apptCollection.deleteOne(
          { name: req.body.name }
        )
        .then(result => {
            if (result.deletedCount === 0) {
                return res.json('No member to delete')
            }
            res.json(`Deleted one member`)
          })
          .catch(error => console.error(error))
      })
    app.listen(8000, function() {
        console.log('listening on 8000')
      })
    
  })
  .catch(error => console.error(error))