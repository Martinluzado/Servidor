
const express = require("express");
const app = express();
app.use(express.json());

//CORS
const cors = require("cors");
app.use(cors());

//CONTROLLERS
const Usuarios = require("./Controles/Usuarios");

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/", Usuarios.todasFiguritas);
app.get("/tengo",  Usuarios.tieneFiguritas);
app.get("/faltan",  Usuarios.faltanFiguritas);
app.get("/repetidas",  Usuarios.repetidasFiguritas);

app.put("/:id", Usuarios.unaFigurita);

//MIDDLEWARES
require('dotenv').config()
const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  }
  app.use(cors(corsOptions))

  // requiero body-parser para manejo de json en requests
  var bodyParser = require('body-parser')
  app.use(bodyParser.json())
  
  // requiero kenxt y defino conexión a base de datos
  const knex = require('knex')({
      client: 'pg',
      connection: {
          host : process.env.POSTGRES_HOST,
          port : process.env.POSTGRES_PORT,
          user : process.env.POSTGRES_USER,
          password : process.env.POSTGRES_PASSWORD,
          database : process.env.POSTGRES_DATABASE,
      }
  });
  
  // requiero encriptación para manejo de passwords
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  
  // requiero jwt
  var jwt = require('jsonwebtoken');
  
  // requiero middleware de autenticación
  const { validateJWT } = require('./middlewares/jwt')

  app.post('/register', (req, res) => {
      // encrito password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(req.body.password, salt);
      knex('credenciales')
          .insert({
              name: req.body.name,
              email: req.body.email,
              password: hash
          })
          .then((result) => {
              return res.json({ success: true });
          })
          .catch((err) => {
              console.error(err);
              return res.json({ success: false, message: 'An error occurred, please try again later.' });
          })
  })
  
  app.post('/login', (req, res) => {
      // consulto si el usuario está registrado
      knex('credenciales')
          .select({
              id: 'id',
              name: 'name',
              email: 'email',
              password: 'password',
          })
          .where('mail', req.body.correo)
          .then((result) => {
              // comparo password para autenticación
              if(bcrypt.compareSync(req.body.contraseña, result[0].contraseña)){
                  return res.json({ success: true, auth_token: jwt.sign({
                      id: result[0].id,
                      nombre: result[0].nombre,
                      correo: result[0].correo,
                  }, process.env.JWT_PRIVATE_KEY) });
              }
              return res.json({ success: false });
          })
          .catch((err) => {
              console.error(err);
              return res.json({ success: false, message: 'An error occurred, please try again later.' });
          })
  })
  
  // esta url estará protegida por el el middleware de autenticación
  app.get('/users', validateJWT, (req, res) => {
      knex('credenciales')
      .select({
          id: 'id',
          nombre: 'nombre',
          correo: 'correo',
      })
      .then((result) => {
          return res.json({ success: true, entries: result });
      })
      .catch((err) => {
          console.error(err);
          return res.json({ success: false, message: 'An error occurred, please try again later.' });
      })
  })

app.listen(3000, () => {
  console.log("Escuchando puerto 3000");
});