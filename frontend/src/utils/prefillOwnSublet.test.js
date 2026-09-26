import test from 'node:test';
import assert from 'node:assert/strict';
import { prefillOwnSublet } from './prefillOwnSublet.js';

test('drafts a title, monthly price and full description from a self-supplied post', () => {
  const post = 'Fall sublet near College Ave\n$1,200/month + utilities\nMessage me for photos.';
  assert.deepEqual(prefillOwnSublet(post), {
    title: 'Fall sublet near College Ave',
    description: post,
    price: '1200',
  });
});

test('does not mistake a security deposit for monthly rent', () => {
  assert.equal(prefillOwnSublet('Room for rent\n$500 deposit\nRent negotiable').price, '');
});

test('does not invent a monthly price for unstructured text', () => {
  assert.equal(prefillOwnSublet('Spring sublet\n$950 negotiable').price, '');
});

test('handles empty text and caps untrusted pasted text', () => {
  assert.deepEqual(prefillOwnSublet(''), { title: '', description: '', price: '' });
  assert.equal(prefillOwnSublet('A'.repeat(5000)).description.length, 4000);
  assert.equal(prefillOwnSublet('A'.repeat(5000)).title.length, 120);
});
