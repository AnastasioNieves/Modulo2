const service = require('../services/notas.service');

async function list(req, res) {
  res.json(await service.list(req.query, req.user));
}

async function getById(req, res) {
  res.json(await service.getById(req.params.id, req.user));
}

async function create(req, res) {
  res.status(201).json(await service.create(req.body, req.user));
}

async function update(req, res) {
  res.json(await service.update(req.params.id, req.body, req.user));
}

async function uploadActa(req, res) {
  res.json(await service.attachActa(req.params.id, req.file, req.user));
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
  uploadActa,
  remove
};
