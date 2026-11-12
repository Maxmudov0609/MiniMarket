// Catalog query parameters are public untrusted input.
// Keep validation independent from the DB so it can be tested without credentials.
export function validProductFilters({ search = '', category = '', min = '', max = '', sort = 'new' } = {}) {
  if ([search, category, min, max, sort].some(value => typeof value !== 'string')) return false;
  if (search.length > 180 || category.length > 180) return false;
  if (!['new', 'asc', 'desc'].includes(sort)) return false;
  const moneyValue = value =>
    value === '' || (/^\d+(?:\.\d{1,2})?$/.test(value) &&
      Number.isFinite(Number(value)) && Number(value) <= 1000000000000);
  if (!moneyValue(min) || !moneyValue(max)) return false;
  if (min !== '' && max !== '' && Number(min) > Number(max)) return false;
  return true;
}
