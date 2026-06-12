jest.mock('../../src/models/Nota');
jest.mock('../../src/models/Proyecto');

const Nota = require('../../src/models/Nota');
const Proyecto = require('../../src/models/Proyecto');
const notasService = require('../../src/services/notas.service');
const ApiError = require('../../src/utils/apiError');

function createQueryWithResult(result) {
  return {
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    then: jest.fn((resolve) => resolve(result))
  };
}

describe('notas.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retrieves a nota for admin users', async () => {
    const nota = { _id: 'note1', alumno: { _id: 'student1' }, profesor: { _id: 'prof1' } };
    Nota.findOne.mockReturnValue(createQueryWithResult(nota));

    const result = await notasService.getById('note1', { role: 'admin' });

    expect(Nota.findOne).toHaveBeenCalledWith({ _id: 'note1', deletedAt: null });
    expect(result).toBe(nota);
  });

  it('throws 403 when profesor does not manage the nota', async () => {
    const nota = { alumno: { _id: 'student1' }, profesor: { _id: 'otherProf' } };
    Nota.findOne.mockReturnValue(createQueryWithResult(nota));

    await expect(
      notasService.getById('note1', { role: 'profesor', profesorId: 'prof1' })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('allows profesor to create nota for own proyecto', async () => {
    Proyecto.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'project1' }) });
    Nota.create.mockResolvedValue({ _id: 'note1' });
    Nota.findOne.mockReturnValue(createQueryWithResult({ _id: 'note1', proyecto: 'project1', alumno: { _id: 'student1' }, profesor: { _id: 'prof1' } }));

    const result = await notasService.create(
      { proyecto: 'project1', score: 80 },
      { role: 'profesor', profesorId: 'prof1' }
    );

    expect(Proyecto.findOne).toHaveBeenCalledWith({ _id: 'project1', profesor: 'prof1', deletedAt: null });
    expect(Nota.create).toHaveBeenCalledWith(expect.objectContaining({ proyecto: 'project1', profesor: 'prof1' }));
    expect(result).toEqual({ _id: 'note1', proyecto: 'project1', alumno: { _id: 'student1' }, profesor: { _id: 'prof1' } });
  });

  it('prevents alumnos from creating notas', async () => {
    await expect(
      notasService.create({}, { role: 'alumno', alumnoId: 'student1' })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('attaches an acta file by delegating to update', async () => {
    const currentNota = { _id: 'note1', alumno: { _id: 'student1' }, profesor: { _id: 'prof1' } };
    const updatedNota = { _id: 'note1', actaUrl: '/uploads/acta.pdf', alumno: { _id: 'student1' }, profesor: { _id: 'prof1' } };
    Nota.findOne.mockReturnValue(createQueryWithResult(currentNota));
    Nota.findByIdAndUpdate.mockResolvedValue(updatedNota);
    Nota.findOne.mockReturnValue(createQueryWithResult(updatedNota));

    const result = await notasService.attachActa('note1', { filename: 'acta.pdf' }, { role: 'admin' });

    expect(Nota.findOne).toHaveBeenCalledWith({ _id: 'note1', deletedAt: null });
    expect(Nota.findByIdAndUpdate).toHaveBeenCalledWith('note1', { actaUrl: '/uploads/acta.pdf' }, { new: true, runValidators: true });
    expect(result).toEqual(updatedNota);
  });

  it('soft deletes an existing nota', async () => {
    const nota = { _id: 'note1', deletedAt: new Date() };
    Nota.findOneAndUpdate.mockResolvedValue(nota);

    const result = await notasService.softDelete('note1');

    expect(Nota.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'note1', deletedAt: null },
      { deletedAt: expect.any(Date) },
      { new: true }
    );
    expect(result).toBe(nota);
  });
});