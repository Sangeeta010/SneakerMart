
const PRODUCTS = [
  {id:1,name:'Swift Runner',brand:'Stride',category:'Running',price:4499,rate:4.6,desc:'Lightweight daily running shoe for road running.',img:'https://images.unsplash.com/photo-1528701800484-130e0b6f5f04?auto=format&fit=crop&w=800&q=60'},
  {id:2,name:'Court Classic',brand:'Heritage',category:'Casual',price:3999,rate:4.3,desc:'Timeless court-style sneaker with durable sole.',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=60'},
  {id:3,name:'Trail Blazer',brand:'Summit',category:'Trail',price:4999,rate:4.7,desc:'Aggressive outsole for off-road adventures.',img:'https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?auto=format&fit=crop&w=800&q=60'},
  {id:4,name:'StreetFlex',brand:'UrbanX',category:'Casual',price:3499,rate:4.1,desc:'Comfort-focused streetwear sneaker.',img:'https://images.unsplash.com/photo-1520975917278-0b0d6b1a5ee9?auto=format&fit=crop&w=800&q=60'},
  {id:5,name:'Sprint Pro',brand:'Velocity',category:'Training',price:5999,rate:4.8,desc:'Performance spikes-inspired cushioning for speed.',img:'https://images.unsplash.com/photo-1600180758890-4b8c3b2f5ae0?auto=format&fit=crop&w=800&q=60'},
  {id:6,name:'Urban Glide',brand:'UrbanX',category:'Casual',price:2799,rate:4.0,desc:'Slip-on comfortable sneaker for everyday wear.',img:'https://images.unsplash.com/photo-1552346154-9ae4b9a1984f?auto=format&fit=crop&w=800&q=60'},
  {id:7,name:'Peak Trail',brand:'Summit',category:'Trail',price:5499,rate:4.5,desc:'Rugged, waterproof trail shoe.',img:'https://images.unsplash.com/photo-1600180758890-4b8c3b2f5ae0?auto=format&fit=crop&w=800&q=60'},
  {id:8,name:'Classic Retro',brand:'Heritage',category:'Casual',price:3199,rate:4.2,desc:'Retro-styled sneaker with cushioned sole.',img:'https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?auto=format&fit=crop&w=800&q=60'},
  {id:9,name:'Velocity Max',brand:'Velocity',category:'Running',price:6999,rate:4.9,desc:'Top-tier marathon shoe with maximal energy return.',img:'https://images.unsplash.com/photo-1528701800484-130e0b6f5f04?auto=format&fit=crop&w=800&q=60'},
  {id:10,name:'Flex Trainer',brand:'Stride',category:'Training',price:3899,rate:4.4,desc:'Versatile cross-trainer with good grip.',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=60'}
];

let state = {
  products: PRODUCTS.slice(),
  filtered: PRODUCTS.slice(),
  perPage: 8,
  page: 1,
  cart: JSON.parse(localStorage.getItem('sneak_cart')||'{}'),
  user: JSON.parse(localStorage.getItem('sneak_user')||'null')
};


const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const money = n => '₹' + n.toLocaleString('en-IN');


function renderProducts(){
  const grid = $('#productGrid');
  const start = (state.page-1)*state.perPage;
  const pageItems = state.filtered.slice(start, start + state.perPage);
  grid.innerHTML = '';
  pageItems.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" />
      <div class="title">${p.name}</div>
      <div class="small">${p.brand} • ${p.category}</div>
      <div class="meta">
        <div class="small">${money(p.price)}</div>
        <div class="small">★ ${p.rate.toFixed(1)}</div>
      </div>
      <div style="display:flex;gap:8px;justify-content:space-between">
        <button class="btn view" data-id="${p.id}">View</button>
        <button class="btn ghost add" data-id="${p.id}">Add</button>
      </div>
    `;
    grid.appendChild(card);
  });
  $('#resultInfo').innerText = `Showing ${state.filtered.length} result(s)`;
  renderPagination();
  attachProductHandlers();
}


function renderPagination(){
  const pag = $('#pagination');
  pag.innerHTML = '';
  const total = Math.ceil(state.filtered.length / state.perPage) || 1;
  for(let i=1;i<=total;i++){
    const btn = document.createElement('button');
    btn.className = 'ghost';
    if(i===state.page) btn.style.fontWeight='700';
    btn.innerText = i;
    btn.addEventListener('click',()=>{ state.page = i; renderProducts(); });
    pag.appendChild(btn);
  }
}


function attachProductHandlers(){
  $$('.view').forEach(b=>b.addEventListener('click', (e)=>{
    const id = Number(e.currentTarget.dataset.id);
    openProductModal(id);
  }));
  $$('.add').forEach(b=>b.addEventListener('click', (e)=>{
    const id = Number(e.currentTarget.dataset.id);
    addToCart(id,1);
  }));
}


function applyFilters(){
  const q = $('#searchInput').value.trim().toLowerCase();
  const cats = $$('.cat:checked').map(i=>i.value);
  const brands = $$('.brand:checked').map(i=>i.value);
  const min = Number($('#priceMin').value)||0;
  const max = Number($('#priceMax').value)||Infinity;
  let arr = state.products.filter(p=>{
    const matchesQ = !q || (p.name + ' ' + p.brand + ' ' + p.desc).toLowerCase().includes(q);
    const matchCat = cats.length===0 || cats.includes(p.category);
    const matchBrand = brands.length===0 || brands.includes(p.brand);
    const matchPrice = p.price >= min && p.price <= max;
    return matchesQ && matchCat && matchBrand && matchPrice;
  });

  const sort = $('#sortSelect').value;
  if(sort==='low') arr.sort((a,b)=>a.price-b.price);
  else if(sort==='high') arr.sort((a,b)=>b.price-a.price);
  else if(sort==='rating') arr.sort((a,b)=>b.rate-a.rate);

  state.filtered = arr;
  state.page = 1;
  renderProducts();
}

function openProductModal(id){
  const p = state.products.find(x=>x.id===id);
  if(!p) return;
  $('#productModal').classList.remove('hidden');
  $('#modalBody').innerHTML = `
    <img src="${p.img}" alt="${p.name}" />
    <div>
      <h2>${p.name}</h2>
      <div class="small">${p.brand} • ${p.category}</div>
      <div style="margin:8px 0;font-weight:700">${money(p.price)}</div>
      <div class="small">Rating: ★ ${p.rate.toFixed(1)}</div>
      <p style="margin-top:8px">${p.desc}</p>
    </div>
  `;
  $('#modalAdd').onclick = ()=>{ addToCart(p.id,1); toast('Added to cart'); };
  $('#modalBuy').onclick = ()=>{ addToCart(p.id,1); checkout(); };
}
$('#closeModal').addEventListener('click', ()=>$('#productModal').classList.add('hidden'));


function saveCart(){
  localStorage.setItem('sneak_cart', JSON.stringify(state.cart));
  renderCart();
}
function addToCart(id, qty=1){
  state.cart[id] = (state.cart[id]||0) + qty;
  saveCart();
  updateCartCount();
}
function removeFromCart(id){
  delete state.cart[id];
  saveCart();
  updateCartCount();
}
function changeQty(id, qty){
  if(qty<=0) removeFromCart(id);
  else { state.cart[id] = qty; saveCart(); }
}
function renderCart(){
  const list = $('#cartList');
  list.innerHTML = '';
  const ids = Object.keys(state.cart).map(Number);
  if(ids.length===0){ 
    list.innerHTML = '<div class="small muted">Your cart is empty</div>'; 
    $('#drawerTotal').innerText = money(0); 
    return; 
  }
  let total = 0;
  ids.forEach(id=>{
    const p = state.products.find(x=>x.id===id);
    const qty = state.cart[id];
    total += p.price * qty;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${p.img}" alt="${p.name}"/>
      <div style="flex:1">
        <div style="font-weight:700">${p.name}</div>
        <div class="small">${money(p.price)} x ${qty} = ${money(p.price*qty)}</div>
        <div class="qty-controls">
          <button class="ghost" data-id="${id}" data-action="dec">-</button>
          <span class="small">${qty}</span>
          <button class="ghost" data-id="${id}" data-action="inc">+</button>
          <button class="ghost" data-id="${id}" data-action="rm" style="margin-left:8px">Remove</button>
        </div>
      </div>
    `;
    list.appendChild(row);
  });
  $('#drawerTotal').innerText = money(total);
  $$('#cartList [data-action]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = Number(e.currentTarget.dataset.id);
      const act = e.currentTarget.dataset.action;
      if(act==='inc') changeQty(id, state.cart[id]+1);
      else if(act==='dec') changeQty(id, state.cart[id]-1);
      else if(act==='rm') removeFromCart(id);
      updateCartCount();
    });
  });
}
function updateCartCount(){
  const count = Object.values(state.cart).reduce((s,n)=>s+n,0);
  $('#cartCount').innerText = count;
}


const cartDrawer = document.getElementById('cartDrawer');
const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.getElementById('closeCart');

openCartBtn.addEventListener('click', () => {
  cartDrawer.classList.toggle('show');
  renderCart();
});

closeCartBtn.addEventListener('click', () => {
  cartDrawer.classList.remove('show');
});


function init(){
  renderProducts();
  updateCartCount();
  updateUserUI();
  
  $('#cartDrawer').classList.add('hidden');

  $('#productModal').addEventListener('click', (e)=>{
    if(e.target.id==='productModal') $('#productModal').classList.add('hidden');
  });

  $('#priceMin').value=''; 
  $('#priceMax').value='';
  applyInitial();
}

function applyInitial(){ 
  state.filtered = state.products.slice(); 
  renderProducts(); 
}

init();


window.addEventListener('load', () => {
  document.getElementById('authModal').classList.remove('hidden');
});


document.getElementById('closeAuth').addEventListener('click', () => {
  document.getElementById('authModal').classList.add('hidden');
});

