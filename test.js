const assert = require('assert');
const { groupTabsByHost, sortedHosts } = require('./extension/popup.js');

// --- groupTabsByHost ---

{
  const tabs = [
    { id: 1, url: 'https://example.com/foo' },
    { id: 2, url: 'https://example.com/bar' },
    { id: 3, url: 'https://github.com/baz' },
  ];
  const groups = groupTabsByHost(tabs);
  assert.deepStrictEqual(groups['example.com'], [1, 2], 'groups http tabs by hostname');
  assert.deepStrictEqual(groups['github.com'], [3], 'groups second host correctly');
  console.log('PASS: groups http/https tabs by hostname');
}

{
  const tabs = [
    { id: 1, url: 'about:blank' },
    { id: 2, url: 'not-a-url' },
    { id: 3, url: 'file:///Users/foo/bar.html' },
  ];
  const groups = groupTabsByHost(tabs);
  assert.deepStrictEqual(groups['chrome & system pages'], [1, 2, 3], 'groups system/unparseable tabs');
  console.log('PASS: groups non-http tabs under chrome & system pages');
}

{
  const groups = groupTabsByHost([]);
  assert.deepStrictEqual(groups, {}, 'empty tab list returns empty groups');
  console.log('PASS: groupTabsByHost handles empty tab list');
}

{
  const tabs = [{ id: 1, url: '' }];
  const groups = groupTabsByHost(tabs);
  assert.deepStrictEqual(groups['chrome & system pages'], [1], 'empty URL goes to system pages');
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

console.log('\nAll tests passed.');
