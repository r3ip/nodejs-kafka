const express = require('express');
const kafka = require('kafka-node');
const mongoose = require('mongoose');
const { model } = require('mongoose');

const app = express();
app.use(express.json());

const dbRuning = async () => {
  mongoose.connect(process.env.MONGO_URL)
  .then(()=> console.log('conected'))
  .catch((err) => console.log(err))

  const User = model( 'user', {
    name: String,
    email: String,
    password: String
  })

  const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS });
  const consumer = new kafka.Consumer(client, [{topic: process.env.KAFKA_TOPIC}], {
    autoCommit: false
  });

  consumer.on( 'message', async (message) =>{
    const user = await new User(JSON.parse(message.value))
    await user.save()
  })

  consumer.on( 'error', (err) => {
    console.log('cosumer-error',err)
  })
}

setTimeout(dbRuning, 10000);

app.listen(process.env.PORT, () => { console.log(`listen on port ${process.env.PORT}`) });