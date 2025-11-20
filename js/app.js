/* Simple front-end demo logic using localStorage.
   - products list (sample)
   - register/login validations (client side)
   - wishlist, orders, reviews stored in localStorage
*/

const PRODUCTS = [
  {id: "p1", name: "Wireless Headphones", price: 1999, img: "assets/images/headphone.jpg"},
  {id: "p2", name: "Smart Watch", price: 2999, img: "assets/images/smartwatch.jpg"},
  {id: "p3", name: "Mechanical Keyboard", price: 3499, img: "assets/images/mechanicalkeyboard.jpg"},
  {id: "p4", name: "USB-C Charger", price: 599, img: "assets/images/charger.jpg"}
];

function $(sel){ return document.querySelector(sel) }
function $all(sel){ return document.querySelectorAll(sel) }

/* Simple user storage */
function getUsers(){ return JSON.parse(localStorage.getItem('users')||'[]') }
function saveUsers(u){ localStorage.setItem('users', JSON.stringify(u)) }
function getCurrentUser(){ return JSON.parse(localStorage.getItem('currentUser')||'null') }
function setCurrentUser(obj){ localStorage.setItem('currentUser', JSON.stringify(obj)) }

/* Products rendering on products.html */
function renderProducts(){
  const grid = $('#products-grid')
  if(!grid) return
  grid.innerHTML = ''
  PRODUCTS.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" style="width:100%;height:150px;object-fit:cover;border-radius:6px" />
      <h4>${p.name}</h4>
      <p>₹${p.price}</p>
      <div style="display:flex;gap:.5rem">
        <button class="btn addCart" data-id="${p.id}">Buy</button>
        <button class="btn addWish" data-id="${p.id}">Wishlist</button>
      </div>
    `
    grid.appendChild(card)
  })
}

/* Register form validation */
function initRegister(){
  const form = $('#registerForm')
  if(!form) return
  form.addEventListener('submit', e=>{
    e.preventDefault()
    const name = $('#name').value.trim()
    const email = $('#email').value.trim().toLowerCase()
    const phone = $('#phone').value.trim()
    const pass = $('#password').value
    const confirm = $('#confirmPassword').value
    const err = $('#registerError')
    err.textContent = ''
    if(name.length<3){ err.textContent='Name must be at least 3 chars'; return }
    if(!/^\S+@\S+\.\S+$/.test(email)){ err.textContent='Invalid email'; return }
    if(!/^\d{10}$/.test(phone)){ err.textContent='Phone must be 10 digits'; return }
    if(pass.length<6){ err.textContent='Password at least 6 chars'; return }
    if(pass!==confirm){ err.textContent='Passwords do not match'; return }
    const users = getUsers()
    if(users.find(u=>u.email===email)){ err.textContent='Email already registered'; return }
    users.push({name,email,phone,password:pass,wishlist:[],orders:[]})
    saveUsers(users)
    alert('Registration successful — please login')
    window.location.href = 'login.html'
  })
}

/* Login handling */
function initLogin(){
  const form = $('#loginForm'); if(!form) return
  form.addEventListener('submit', e=>{
    e.preventDefault()
    const email = $('#loginEmail').value.trim().toLowerCase()
    const pass = $('#loginPassword').value
    const err = $('#loginError'); err.textContent=''
    const users = getUsers()
    const u = users.find(x=>x.email===email && x.password===pass)
    if(!u){ err.textContent='Invalid credentials'; return }
    setCurrentUser(u)
    alert('Login success')
    window.location.href = 'index.html'
  })
}

/* Wishlist & orders: store under user object */
function initProductActions(){
  document.addEventListener('click', e=>{
    if(e.target.matches('.addWish')){
      const id = e.target.dataset.id
      const u = getCurrentUser()
      if(!u){ alert('Please login'); window.location.href='login.html'; return }
      if(!u.wishlist) u.wishlist=[]
      if(!u.wishlist.includes(id)) u.wishlist.push(id)
      updateUserInStorage(u)
      alert('Added to wishlist')
    }
    if(e.target.matches('.addCart')){
      const id = e.target.dataset.id
      const u = getCurrentUser()
      if(!u){ alert('Please login'); window.location.href='login.html'; return }
      if(!u.orders) u.orders=[]
      const product = PRODUCTS.find(p=>p.id===id)
      u.orders.push({orderId:'ORD'+Date.now(),productId:id,name:product.name,price:product.price,date:new Date().toLocaleString()})
      updateUserInStorage(u)
      alert('Order placed')
    }
  })
}

function updateUserInStorage(user){
  const users = getUsers()
  const idx = users.findIndex(u=>u.email===user.email)
  if(idx>-1) users[idx] = user
  else users.push(user)
  saveUsers(users)
  setCurrentUser(user)
}

/* Render wishlist / orders */
function renderWishlist(){
  const cont = $('#wishlist'); if(!cont) return
  const u = getCurrentUser(); if(!u) { cont.innerHTML='<p>Please login to see wishlist</p>'; return }
  if(!u.wishlist || u.wishlist.length===0) { cont.innerHTML='<p>No items</p>'; return }
  cont.innerHTML = u.wishlist.map(id=>{
    const p = PRODUCTS.find(x=>x.id===id)
    return `<div class="card"><h4>${p.name}</h4><p>₹${p.price}</p></div>`
  }).join('')
}
function renderOrders(){
  const cont = $('#ordersList'); if(!cont) return
  const u = getCurrentUser(); if(!u) { cont.innerHTML='<p>Please login</p>'; return }
  if(!u.orders || u.orders.length===0) { cont.innerHTML='<p>No orders</p>'; return }
  cont.innerHTML = u.orders.map(o=>`<div class="card"><h4>${o.name}</h4><p>Order: ${o.orderId}</p><p>₹${o.price} — ${o.date}</p></div>`).join('')
}

/* Support & reviews */
function initSupportAndReviews(){
  const sForm = $('#supportForm'); if(sForm){
    sForm.addEventListener('submit', e=>{
      e.preventDefault()
      const email = $('#supportEmail').value; const msg = $('#supportMsg').value
      const logs = JSON.parse(localStorage.getItem('support')||'[]')
      logs.push({email,msg,date:new Date().toLocaleString()})
      localStorage.setItem('support', JSON.stringify(logs))
      alert('Support request submitted')
      sForm.reset()
    })
  }
  const rvForm = $('#reviewForm'); if(rvForm){
    rvForm.addEventListener('submit', e=>{
      e.preventDefault()
      const pid = $('#revProductId').value.trim(); const txt = $('#revText').value.trim()
      const r = JSON.parse(localStorage.getItem('reviews')||'[]')
      r.push({productId:pid,review:txt,date:new Date().toLocaleString()})
      localStorage.setItem('reviews', JSON.stringify(r))
      renderReviews()
      rvForm.reset()
    })
  }
  renderReviews()
}
function renderReviews(){
  const cont = $('#reviews'); if(!cont) return
  const r = JSON.parse(localStorage.getItem('reviews')||'[]')
  if(r.length===0) { cont.innerHTML='<p>No reviews yet</p>'; return }
  cont.innerHTML = r.map(x=>`<div class="card"><strong>Product:${x.productId}</strong><p>${x.review}</p><small>${x.date}</small></div>`).join('')
}

/* Boot */
document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts()
  initRegister()
  initLogin()
  initProductActions()
  renderWishlist()
  renderOrders()
  initSupportAndReviews()
})
