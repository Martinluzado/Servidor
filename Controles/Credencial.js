const router = require("express").Router();

const knex = require("knex")({
    client: "pg",
    connection: {
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "Admin1234",
      database: "postgres",
    },
    searchPath: ["knex", "credenciales"],
  });

const bcrypt = require("bcrypt");
const { SECRET } = require("../middlewares/jwt");
const jwt = require("jsonwebtoken");

router.post("/register", (req, res, next) => {
  const salt = bcrypt.genSaltSync(10);
  const pwd = bcrypt.hashSync(req.body.contraseña, salt);

  if (
    req.body.nombre.length === 0 ||
    req.body.correo.length === 0 ||
    req.body.contraseña.length === 0
  ) {
    res.status(400).json({ msg: "falta nombre, mail o password" });
  }
  knex("usuarios")
    .returning(["id", "mail"])
    .insert({
      nombre: req.body.nombre,
      correo: req.body.correo,
      password: pwd,
    })
    .then((respuesta) => {
      res.status(201).json(respuesta[0]);
      next();
    })
    .catch((err) => {
      res.status(500).send("error");
      next();
    });
});

router.post("/login", (req, res, next) => {
  knex
    .select("id", "correo", "contraseña")
    knex.select('*')
    .where("correo", req.body.correo)
    .then((filas) => {
      if (filas.length === 1) {
        if (bcrypt.compareSync(req.body.contraseña, filas[0].contraseña)) {
          res.status(200).json({
            id: filas[0].id,
            success: true,
            msg: "logueado correctamente",
            auth_token: jwt.sign(
              {
                id: filas[0].id,
                correo: filas[0].correo,
                texto_random: "hola senpai",
              },
              SECRET
            ),
          });
        } else {
          res.status(404).json({ msg: "mail o password incorrecto" });
        }
      } else {
        res.status(404).json({ msg: "mail o password incorrecto" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("error");
      next();
    })
    .finally(() => {
      next();
    });
});

module.exports = router;
