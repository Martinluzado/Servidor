const express = require("express");
const app = express();

//KNEX

const knex = require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "Admin1234",
    database: "postgres",
  },
  searchPath: ["knex", "album"],
});

exports.todasFiguritas = function (req, res, next) {
  const r = knex
  knex.select('*')
  .from('album')
    .then((resultado) => {
      res.status(200).json(resultado);
      next();
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.tieneFiguritas = function (req, res, next) {
  const r = knex
  knex.select('*')
  .from('album')
    .where({
      tengo: "true",
    })
    .then((resultado) => {
      res.status(200).json(resultado);
      next();
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.faltanFiguritas = function (req, res, next) {
  const r = knex
  knex.select('*')
  .from('album')
    .where({
      tengo: "false",
    })
    .then((resultado) => {
      res.status(200).json(resultado);
      next();
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.repetidasFiguritas = function (req, res, next) {
  const r = knex
  knex.select('*')
  .from('album')
    .where("cantidad", ">", 0)
    .then((resultado) => {
      res.status(200).json(resultado);
      next();
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.unaFigurita = function (req, res, next) {
  const cambio = req.body;
  const id = req.params.id;
  const r = knex
    .update({
      tengo: true,
    })
    .from("album")
    .where("id", "=", id)
    .then((response) => {
      res.status(200).json({ message: "se agrego" });
      next();
    })
    .catch((err) => {
      console.log(err);
      next();
    });
};
