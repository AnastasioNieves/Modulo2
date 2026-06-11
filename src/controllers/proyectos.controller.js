const service = require('../services/proyectos.service');

async function list(req, res) {
  res.json(await service.list(req.query));
}

async function getById(req, res) {
  res.json(await service.getById(req.params.id));
}

async function create(req, res) {
  res.status(201).json(await service.create(req.body));
}

async function update(req, res) {
  res.json(await service.update(req.params.id, req.body));
}

async function remove(req, res) {
  await service.softDelete(req.params.id);
  res.status(204).send();
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};
