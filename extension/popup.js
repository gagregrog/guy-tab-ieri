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
    groups[host].push({ id: tab.id, url: tab.url, index: tab.index });
  }
  return groups;
}

function sortedHosts(groups) {
  return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
}

function hostnameIcon(hostname) {
  let hash = 5381;
  for (let i = 0; i < hostname.length; i++) {
    hash = ((hash << 5) + hash) + hostname.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 36;
}

function render(groups) {
  const list = document.getElementById('host-list');
  const sorted = sortedHosts(groups);
  if (sorted.length === 0) {
    list.appendChild(makeEmpty());
    return;
  }
  list.replaceChildren();
  for (const [host, tabObjects] of sorted) {
    const row = document.createElement('div');
    row.className = 'row';

    const icon = document.createElement('img');
    icon.src = `fieri/${hostnameIcon(host)}.png`;
    icon.className = 'host-icon';

    const span = document.createElement('span');
    span.className = 'host';
    span.textContent = `${host} (${tabObjects.length} tab${tabObjects.length === 1 ? '' : 's'})`;

    const btn = document.createElement('button');
    btn.textContent = 'Close All';

    function handleCloseAll() {
      const ids = tabObjects.map(t => t.id);
      const sortedByIndex = [...tabObjects].sort((a, b) => a.index - b.index);

      // Swap to icy blue countdown button immediately
      row.style.pointerEvents = 'none';
      btn.style.pointerEvents = 'auto';
      btn.style.background = 'linear-gradient(135deg, #00b4d8, #90e0ef)';
      btn.removeEventListener('click', handleCloseAll);
      btn.addEventListener('click', handleUndo, { once: true });

      let secondsLeft = 10;
      btn.textContent = `Undo (${secondsLeft}s)`;
      const countdown = setInterval(() => {
        secondsLeft--;
        btn.textContent = `Undo (${secondsLeft}s)`;
      }, 1000);

      const timer = setTimeout(() => {
        clearInterval(countdown);
        row.style.transition = 'opacity 0.3s';
        row.style.opacity = '0';
        setTimeout(() => { row.remove(); checkEmpty(); }, 300);
      }, 10000);

      // Remove tabs immediately. In Chrome, if the active tab is in this group,
      // the popup will close (Chrome limitation — any active-tab change dismisses
      // the popup, including the workaround of switching first). When the active
      // tab is not in the group the popup stays open and undo works normally.
      chrome.tabs.remove(ids);

      function handleUndo() {
        clearTimeout(timer);
        clearInterval(countdown);
        // Restore the row immediately.
        row.style.transition = '';
        row.style.pointerEvents = '';
        btn.style.background = '';
        btn.textContent = 'Close All';
        btn.removeEventListener('click', handleUndo);
        btn.addEventListener('click', handleCloseAll);
        // Recreate tabs in the background and update tabObjects with new IDs
        // so that a subsequent Close All on this row works correctly.
        // No re-render — that would clear the row before Chrome has registered
        // the new tabs in chrome.tabs.query.
        const newTabObjects = [];
        function recreate(i) {
          if (i >= sortedByIndex.length) {
            tabObjects.splice(0, tabObjects.length, ...newTabObjects);
            return;
          }
          chrome.tabs.create({ url: sortedByIndex[i].url, active: false, index: sortedByIndex[i].index }, (newTab) => {
            if (newTab) newTabObjects.push({ id: newTab.id, url: sortedByIndex[i].url, index: newTab.index });
            recreate(i + 1);
          });
        }
        recreate(0);
      }
    }

    btn.addEventListener('click', handleCloseAll);

    row.appendChild(icon);
    row.appendChild(span);
    row.appendChild(btn);
    list.appendChild(row);
  }
}

function makeEmpty() {
  const empty = document.createElement('div');
  empty.id = 'empty';
  const left = document.createElement('img');
  left.src = 'fieri/23.png';
  left.style.cssText = 'width:28px;height:28px;vertical-align:middle;margin-right:8px;';
  const right = document.createElement('img');
  right.src = 'fieri/34.png';
  right.style.cssText = 'width:28px;height:28px;vertical-align:middle;margin-left:8px;';
  empty.appendChild(left);
  empty.appendChild(document.createTextNode('No tabs in Flavortown'));
  empty.appendChild(right);
  return empty;
}

function checkEmpty() {
  const list = document.getElementById('host-list');
  if (list.querySelectorAll('.row').length === 0) {
    list.replaceChildren();
    list.appendChild(makeEmpty());
  }
}

if (typeof chrome !== 'undefined' && chrome.tabs) {
  document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      render(groupTabsByHost(tabs));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const buttons = Array.from(document.querySelectorAll('#host-list button'));
      if (buttons.length === 0) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  });
}

if (typeof module !== 'undefined') {
  module.exports = { groupTabsByHost, sortedHosts, hostnameIcon };
}
