let entries = [];
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const searchBtn = document.getElementById('searchBtn');
const results = document.getElementById('results');
const status = document.getElementById('status');
const count = document.getElementById('count');
const empty = document.getElementById('empty');

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function highlight(text, query) {
  const safe = escapeHtml(text);
  if (!query) return safe;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(escaped, 'ig'), m => `<mark>${m}</mark>`);
}

function render(list, query='') {
  results.innerHTML = '';
  empty.classList.toggle('hidden', list.length !== 0);
  count.textContent = list.length ? `${list.length} result${list.length === 1 ? '' : 's'}` : '';
  list.slice(0, 100).forEach(entry => {
    const card = document.createElement('article');
    card.className = 'entry';
    card.innerHTML = `
      <div class="entry-top">
        <h2 class="word">${highlight(entry.headword, query)}</h2>
        <span class="pos">${escapeHtml(entry.pos)}</span>
      </div>
      <div class="definition">${highlight(entry.text, query)}</div>
      <div class="source">PDF page ${entry.source_page}</div>
    `;
    results.appendChild(card);
  });
  if (list.length > 100) {
    count.textContent += ' · showing first 100';
  }
}

function doSearch() {
  const q = searchInput.value.trim().toLocaleLowerCase();
  if (!q) {
    status.textContent = 'Search the dictionary';
    render(entries.slice(0, 40));
    return;
  }
  const found = entries.filter(e => e.search.includes(q) || e.text.toLocaleLowerCase().includes(q));
  status.textContent = `Results for “${searchInput.value.trim()}”`;
  render(found, searchInput.value.trim());
}

async function loadDictionary() {
  try {
    const response = await fetch('dictionary.json');
    if (!response.ok) throw new Error('Could not load dictionary.json');
    const data = await response.json();
    entries = data.entries || [];
    status.textContent = `Dictionary loaded · ${entries.length.toLocaleString()} entries`;
    render(entries.slice(0, 40));
  } catch (error) {
    const embedded = document.getElementById('embeddedDictionary');
    if (embedded) {
      try {
        const data = JSON.parse(embedded.textContent);
        entries = data.entries || [];
        status.textContent = `Dictionary loaded · ${entries.length.toLocaleString()} entries`;
        render(entries.slice(0, 40));
        return;
      } catch (embeddedError) {}
    }
    status.textContent = 'Could not load the dictionary data.';
    results.innerHTML = `<div class="entry"><strong>Error:</strong> ${escapeHtml(error.message)}<br><br>Try opening this page through GitHub Pages or a local web server.</div>`;
  }
}

searchInput.addEventListener('input', doSearch);
searchInput.addEventListener('keydown', event => { if (event.key === 'Enter') doSearch(); });
searchBtn.addEventListener('click', doSearch);
clearBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.focus(); doSearch(); });
loadDictionary();
