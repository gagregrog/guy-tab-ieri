function groupTabsByHost(tabs) {
  const groups = {};
  for (const tab of tabs) {
    let host;
    try {
      const url = new URL(tab.url);
      host = (url.protocol === 'http:' || url.protocol === 'https:')
        ? url.hostname
        : 'chrome & system pages';
    } catch {
      host = 'chrome & system pages';
    }
    if (!groups[host]) groups[host] = [];
    groups[host].push(tab.id);
  }
  return groups;
}

function sortedHosts(groups) {
  return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
}

function render(groups) {
  const list = document.getElementById('host-list');
  const sorted = sortedHosts(groups);
  if (sorted.length === 0) {
    const empty = document.createElement('div');
    empty.id = 'empty';
    empty.textContent = 'No tabs in Flavor Town 🔥';
    list.appendChild(empty);
    return;
  }
  list.replaceChildren();
  for (const [host, ids] of sorted) {
    const row = document.createElement('div');
    row.className = 'row';
    const span = document.createElement('span');
    span.className = 'host';
    span.textContent = `${host} (${ids.length} tab${ids.length === 1 ? '' : 's'})`;
    const btn = document.createElement('button');
    btn.textContent = 'Close All';
    btn.addEventListener('click', () => {
      chrome.tabs.remove(ids);
      row.remove();
    });
    row.appendChild(span);
    row.appendChild(btn);
    list.appendChild(row);
  }
}

if (typeof chrome !== 'undefined' && chrome.tabs) {
  document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      render(groupTabsByHost(tabs));
    });
  });
}

if (typeof module !== 'undefined') {
  module.exports = { groupTabsByHost, sortedHosts };
}
