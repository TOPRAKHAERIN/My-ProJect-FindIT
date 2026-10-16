const initialPosts = [
  {id: 1, type: 'lost', title: 'บัตรนักเรียน', category: 'บัตรนักเรียน', location: 'อาคาร 3 ชั้น 2', date: '12 ส.ค. 2569', details: 'บัตรชื่อ พิมพ์ชนก มีสายคล้องสีน้ำเงิน', icon: '▣', color: 'blue', active: true},
  {id: 2, type: 'found', title: 'กุญแจรถยนต์', category: 'กุญแจ', location: 'ลานจอดรถหน้าอาคาร 1', date: '12 ส.ค. 2569', details: 'กุญแจพร้อมพวงกุญแจรูปหมี ฝากไว้ที่ห้องปกครอง', icon: '⌁', color: 'orange', active: true},
  {id: 3, type: 'lost', title: 'กระเป๋าผ้าสีครีม', category: 'กระเป๋า', location: 'โรงอาหาร', date: '11 ส.ค. 2569', details: 'ภายในมีสมุดโน้ตและกระเป๋าดินสอ', icon: '♧', color: 'purple', active: true},
  {id: 4, type: 'found', title: 'หูฟังไร้สายสีขาว', category: 'อุปกรณ์ไอที', location: 'ห้องสมุด', date: '10 ส.ค. 2569', details: 'พบที่โต๊ะอ่านหนังสือ ฝากไว้ที่เคาน์เตอร์ห้องสมุด', icon: '◉', color: 'blue', active: true},
  {id: 5, type: 'lost', title: 'เครื่องคิดเลข', category: 'อุปกรณ์ไอที', location: 'อาคาร 4 ห้อง 421', date: '08 ส.ค. 2569', details: 'เครื่องสีดำ มีสติกเกอร์ชื่อด้านหลัง', icon: '▦', color: 'orange', active: false}
];
let posts = JSON.parse(localStorage.getItem('lostFoundPosts') || 'null') || initialPosts;
const $ = (selector) => document.querySelector(selector);
const formatDate = (raw) => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(raw));

function savePosts() { localStorage.setItem('lostFoundPosts', JSON.stringify(posts)); }
function card(post) {
  const typeText = post.type === 'lost' ? 'ของหาย' : 'พบของ';
  const state = post.active ? typeText : 'ส่งคืนแล้ว';
  const image = post.image ? `<img class="item-image" src="${post.image}" alt="${post.title}">` : `<div class="item-image item-placeholder ${post.color || 'blue'}">${post.icon || '◈'}</div>`;
  return `<article class="post-card"><div class="card-top">${image}<span class="badge ${post.active ? post.type : 'returned'}">${state}</span></div><h3>${post.title}</h3><p class="category">${post.category}</p><p class="info"><span>⌖</span>${post.location}<br><span>◷</span>${post.date}</p><div class="card-bottom"><span>${post.details || 'ไม่มีรายละเอียดเพิ่มเติม'}</span>${post.active ? `<button class="status-button" data-id="${post.id}">อัปเดตสถานะ</button>` : ''}</div></article>`;
}
function renderPosts() {
  const keyword = $('#searchInput').value.trim().toLowerCase();
  const category = $('#categoryFilter').value;
  const status = $('#statusFilter').value;
  const shown = posts.filter(p => {
    const content = `${p.title} ${p.category} ${p.location} ${p.details}`.toLowerCase();
    return (!keyword || content.includes(keyword)) && (category === 'all' || p.category === category) && (status === 'all' || (status === 'active' ? p.active : !p.active));
  });
  $('#postGrid').innerHTML = shown.map(card).join('');
  $('#emptyState').hidden = Boolean(shown.length);
  $('#lostCount').textContent = posts.filter(p => p.type === 'lost' && p.active).length;
  $('#foundCount').textContent = posts.filter(p => p.type === 'found' && p.active).length;
  $('#returnedCount').textContent = posts.filter(p => !p.active).length;
}
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2800); }
function openPost(type = 'lost') { if (!localStorage.getItem('lostFoundUser')) { $('#loginModal').showModal(); toast('กรุณาเข้าสู่ระบบก่อนลงประกาศ'); return; } document.querySelector(`input[name="postType"][value="${type}"]`).checked = true; $('#postModal').showModal(); }

$('#loginBtn').addEventListener('click', () => $('#loginModal').showModal());
$('#openPostBtn').addEventListener('click', () => openPost());
document.querySelectorAll('[data-post-type]').forEach(btn => btn.addEventListener('click', () => openPost(btn.dataset.postType)));
document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => document.getElementById(btn.dataset.close).close()));
$('#loginForm').addEventListener('submit', (event) => { event.preventDefault(); const name = $('#username').value; localStorage.setItem('lostFoundUser', name); $('#loginModal').close(); $('#loginBtn').textContent = `สวัสดี, ${name}`; toast('เข้าสู่ระบบเรียบร้อยแล้ว'); });
$('#postForm').addEventListener('submit', (event) => { event.preventDefault(); const form = new FormData(event.target); const file = form.get('image'); const publish = (image = '') => { posts.unshift({ id: Date.now(), type: form.get('postType'), title: form.get('title'), category: form.get('category'), location: form.get('location'), date: formatDate(form.get('date')), details: form.get('details'), active: true, icon: '◈', color: 'blue', image }); savePosts(); renderPosts(); $('#postModal').close(); event.target.reset(); toast('เผยแพร่ประกาศเรียบร้อยแล้ว'); location.hash = 'announcements'; };
  if (file && file.size) { const reader = new FileReader(); reader.onload = () => publish(reader.result); reader.readAsDataURL(file); } else publish();
});
$('#postGrid').addEventListener('click', (event) => { const button = event.target.closest('.status-button'); if (!button) return; const post = posts.find(p => p.id === Number(button.dataset.id)); if (post && confirm(`ยืนยันว่ารับคืน "${post.title}" แล้ว?`)) { post.active = false; savePosts(); renderPosts(); toast('อัปเดตเป็น “ส่งคืนแล้ว” เรียบร้อย'); } });
['searchInput', 'categoryFilter', 'statusFilter'].forEach(id => $("#" + id).addEventListener('input', renderPosts));
if (localStorage.getItem('lostFoundUser')) $('#loginBtn').textContent = `สวัสดี, ${localStorage.getItem('lostFoundUser')}`;
renderPosts();
