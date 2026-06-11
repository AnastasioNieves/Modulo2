function parsePositiveInt(value, fallback, max = 100) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function parsePagination(query = {}, allowedSortFields = []) {
  const page = parsePositiveInt(query.page, 1, 10000);
  const limit = parsePositiveInt(query.limit, 20, 100);
  const rawSort = String(query.sort || '-createdAt');
  const direction = rawSort.startsWith('-') ? -1 : 1;
  const field = rawSort.replace(/^-/, '');
  const safeField = allowedSortFields.includes(field) ? field : 'createdAt';

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sort: { [safeField]: direction }
  };
}

module.exports = {
  parsePagination
};
