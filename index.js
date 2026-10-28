const express = require("express");
const app = express();
const port = 3000;

const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb+srv://sebastiancossio111_db_user:Y6eRXaa2RMMAwZXk@cluster0.izg3rja.mongodb.net/tutorial10?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true";

const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: true
});

async function main() {
  try {
    await client.connect();
    console.log("Conectado a la base de datos");
    const database = client.db("tutorial10");

    app.use(express.json());

    app.get("/sensores", async (req, res) => {
      try {
        const sensors = await database.collection("sensores").find().toArray();
        res.status(200).send(sensors);
      } catch (error) {
        console.error(error);
        res.status(500).send(error);
      }
    });

    app.post("/sensores", async (req, res) => {
      try {
        let sensor = req.body;
        const sensorsCollection = database.collection("sensores");
        await sensorsCollection.insertOne(sensor);
        console.log(sensor);
        res.status(201).send(sensor);
      } catch (error) {
        console.error(error);
        res.status(500).send(error);
      }
    });

    app.get("/sensores/:sensorId", async (req, res) => {
      try {
        let sensorId = req.params.sensorId;
        const sensor = await database
          .collection("sensores")
          .findOne({ _id: new ObjectId(sensorId) });

        if (sensor !== null) {
          res.status(200).send(sensor);
        } else {
          res.status(404).send(`El sensor con id: ${sensorId} no existe`);
        }
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });

    app.post("/sensores/:sensorId/mediciones", async (req, res) => {
      try {
        let sensorId = req.params.sensorId;
        let measurement = req.body;
        const updateSensor = {
          $addToSet: { mediciones: measurement }
        };

        const result = await database
          .collection("sensores")
          .updateOne({ _id: new ObjectId(sensorId) }, updateSensor);

        if (result.matchedCount > 0) {
          console.log(measurement);
          res.status(201).send(measurement);
        } else {
          res.status(404).send(`El sensor con id: ${sensorId} no existe`);
        }
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });

    app.listen(port, () => {
      console.log(`Servidor escuchando en el puerto: ${port}`);
    });
  } catch (error) {
    console.error("Error al conectar a la base de datos", error);
  }
}

main();