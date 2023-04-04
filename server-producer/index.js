const express = require('express');
const kafka = require('kafka-node');
const sequelize = require('sequelize')

const app = express();
app.use(express.json());

const dbRuning = async () => {
  const postgresDb = new sequelize(process.env.POSTGRES_URL)
  const User = postgresDb.define( 'user', {
    name: sequelize.STRING,
    email: sequelize.STRING,
    password: sequelize.STRING
  });
  postgresDb.sync({force: true})

  const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS });
  const producer = new kafka.Producer(client);

  producer.on('ready', async () => {
    console.log('producer ready');

    app.post('/consumer', async (req, res) => {
      producer.send([{
          topic: process.env.KAFKA_TOPIC,
          messages: JSON.stringify(req.body)}],  async (err, data) => {
        if (err) console.log('producer-error:',err)
        else {
          await User.create(req.body)
          res.send(req.body)
        }
      })
    });

  })
}

setTimeout(dbRuning, 1000);

app.listen(process.env.PORT, () => { console.log(`listen on port ${process.env.PORT}`) });