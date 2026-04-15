const assert = require('assert');
const { groupTabsByHost, sortedHosts, hostnameIcon } = require('./extension/popup.js');

// --- groupTabsByHost ---

{
  const tabs = [
    { id: 1, url: 'https://example.com/foo', index: 0 },
    { id: 2, url: 'https://example.com/bar', index: 1 },
    { id: 3, url: 'https://github.com/baz', index: 2 },
  ];
  const groups = groupTabsByHost(tabs);
  assert.deepStrictEqual(groups['example.com'], [
    { id: 1, url: 'https://example.com/foo', index: 0 },
    { id: 2, url: 'https://example.com/bar', index: 1 },
  ], 'groups http tabs by hostname');
  assert.deepStrictEqual(groups['github.com'], [
    { id: 3, url: 'https://github.com/baz', index: 2 },
  ], 'groups second host correctly');
  console.log('PASS: groups http/https tabs by hostname');
}

{
  const tabs = [
    { id: 1, url: 'about:blank', index: 0 },
    { id: 2, url: 'not-a-url', index: 1 },
    { id: 3, url: 'file:///Users/foo/bar.html', index: 2 },
  ];
  const groups = groupTabsByHost(tabs);
  assert.deepStrictEqual(groups['chrome & system pages'], [
    { id: 1, url: 'about:blank', index: 0 },
    { id: 2, url: 'not-a-url', index: 1 },
    { id: 3, url: 'file:///Users/foo/bar.html', index: 2 },
  ], 'groups system/unparseable tabs');
  console.log('PASS: groups non-http tabs under chrome & system pages');
}

{
  const groups = groupTabsByHost([]);
  assert.deepStrictEqual(groups, {}, 'empty tab list returns empty groups');
  console.log('PASS: groupTabsByHost handles empty tab list');
}

{
  const tabs = [{ id: 1, url: '', index: 0 }];
  const groups = groupTabsByHost(tabs);
  assert.deepStrictEqual(groups['chrome & system pages'], [
    { id: 1, url: '', index: 0 },
  ], 'empty URL goes to system pages');
  console.log('PASS: groupTabsByHost handles empty string URL');
}

// --- sortedHosts ---

{
  const groups = {
    'a.com': [1],
    'b.com': [2, 3, 4],
    'c.com': [5, 6],
  };
  const sorted = sortedHosts(groups);
  assert.strictEqual(sorted[0][0], 'b.com', 'highest count first');
  assert.strictEqual(sorted[1][0], 'c.com', 'second highest next');
  assert.strictEqual(sorted[2][0], 'a.com', 'lowest count last');
  console.log('PASS: sortedHosts returns entries in descending tab count order');
}

{
  const groups = { 'x.com': [1, 2], 'y.com': [3, 4] };
  const sorted = sortedHosts(groups);
  assert.strictEqual(sorted.length, 2, 'both tied hosts returned');
  assert.strictEqual(sorted[0][0], 'x.com', 'tie: insertion order preserved');
  assert.strictEqual(sorted[1][0], 'y.com', 'tie: second host follows');
  console.log('PASS: sortedHosts preserves insertion order on tie');
}

{
  const groups = { 'only.com': [1] };
  const sorted = sortedHosts(groups);
  assert.strictEqual(sorted.length, 1, 'single host returned');
  assert.strictEqual(sorted[0][0], 'only.com');
  console.log('PASS: sortedHosts handles single host');
}

// --- hostnameIcon ---

{
  const idx = hostnameIcon('google.com');
  assert(idx >= 0 && idx <= 35, `index must be 0-35, got ${idx}`);
  assert.strictEqual(hostnameIcon('google.com'), hostnameIcon('google.com'), 'same host always returns same icon');
  assert.notStrictEqual(hostnameIcon('google.com'), hostnameIcon('github.com'), 'google.com and github.com get different icons');
  assert.notStrictEqual(hostnameIcon('apple.com'), hostnameIcon('amazon.com'), 'apple.com and amazon.com get different icons');
  console.log('PASS: hostnameIcon returns stable index in range 0-35');
}

console.log('\nAll tests passed.');
