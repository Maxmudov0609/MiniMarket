import test from 'node:test';
import assert from 'node:assert/strict';
import { validProductFilters } from '../catalogFilters.js';

test('catalog filters accept normal searches and prices', () => {
  assert.equal(validProductFilters({}), true);
  assert.equal(validProductFilters({search:'Fanta',category:'Ichimliklar',min:'0',max:'25000.50',sort:'asc'}), true);
});
test('catalog filters reject malformed untrusted query parameters', () => {
  for (const params of [
    {search:['A','B']},{category:{x:'y'}},{sort:'unexpected'},
    {min:'nan'},{min:'-1'},{max:'Infinity'},{max:'1e20'},
    {min:'200',max:'100'},{search:'a'.repeat(181)},
    {category:'b'.repeat(181)},{min:'1000000000001'}
  ]) assert.equal(validProductFilters(params), false, JSON.stringify(params));
});
