const photos = JSON.parse(document.getElementById('gallery-data').textContent);
const cards = [...document.querySelectorAll('.g-card')];
const filters = [...document.querySelectorAll('[data-filter]')];
const modal = document.getElementById('g-lightbox');
const status = document.getElementById('g-status');
const categoryNames = { all: 'Tümü', egitim: 'Eğitimler', uygulama: 'Uygulamalar', bulusma: 'Uluslararası buluşmalar' };
let active = 0, opener, visible = photos.map((_, i) => i);

function show(index) {
  active = index;
  const photo = photos[index];
  modal.querySelector('img').src = photo.src;
  modal.querySelector('img').alt = photo.alt || photo.title;
  document.getElementById('g-caption').textContent = photo.title;
  document.getElementById('g-position').textContent = `${visible.indexOf(index) + 1} / ${visible.length}`;
}
function openPhoto(index, trigger) {
  opener = trigger;
  show(index);
  modal.showModal();
}
function filter(category, updateUrl = false) {
  if (!filters.some(button => button.dataset.filter === category)) category = 'all';
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  visible = [];
  cards.forEach((card, index) => {
    card.hidden = category !== 'all' && card.dataset.category !== category;
    if (!card.hidden) visible.push(index);
  });
  status.textContent = `${categoryNames[category]} · ${visible.length} fotoğraf`;
  if (updateUrl) {
    const url = new URL(location.href);
    if (category === 'all') url.searchParams.delete('kategori');
    else url.searchParams.set('kategori', category);
    url.searchParams.delete('foto');
    history.replaceState(null, '', url);
  }
}
cards.forEach((card, index) => card.addEventListener('click', () => openPhoto(index, card)));
filters.forEach(button => button.addEventListener('click', () => filter(button.dataset.filter, true)));
function step(direction) {
  if (visible.length) show(visible[(visible.indexOf(active) + direction + visible.length) % visible.length]);
}
document.getElementById('g-prev').onclick = () => step(-1);
document.getElementById('g-next').onclick = () => step(1);
document.getElementById('g-close').onclick = () => modal.close();
modal.addEventListener('close', () => opener?.focus());
modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });
modal.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    step(event.key === 'ArrowRight' ? 1 : -1);
  }
});
const params = new URLSearchParams(location.search);
filter(params.get('kategori') || 'all');
const requestedPhoto = photos.findIndex(photo => photo.no === params.get('foto'));
if (requestedPhoto !== -1 && visible.includes(requestedPhoto)) openPhoto(requestedPhoto, cards[requestedPhoto]);
