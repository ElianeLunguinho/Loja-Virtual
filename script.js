// Enhanced Loja Virtual - Auth, Cart, Filters
document.addEventListener('DOMContentLoaded', () => {
  // Existing theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark');
  }
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  });

  // Data
  const products = [
    { id: 1, category: 'roupas', name: 'Roupas - Camiseta Moderna', price: 49.99, img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 2, category: 'eletronicos', name: 'Eletrônicos - Smartphone Pro', price: 799.99, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 3, category: 'acessorios', name: 'Acessórios - Relógio Elegante', price: 199.99, img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 4, category: 'calcados', name: 'Calçados - Tênis Esportivo', price: 129.99, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
  ];

  // Auth
  let currentUser = localStorage.getItem('currentUser') || null;
  const users = JSON.parse(localStorage.getItem('users')) || [];

  const authBtn = document.getElementById('auth-btn');
  const authModal = document.getElementById('auth-modal');
  const authTabs = document.querySelectorAll('.tab-btn');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const closes = document.querySelectorAll('.close');

  function updateAuthUI() {
    if (currentUser) {
      authBtn.textContent = `Olá, ${currentUser}`;
      authBtn.classList.add('logged-in');
    } else {
      authBtn.textContent = 'Login / Cadastro';
      authBtn.classList.remove('logged-in');
    }
  }

  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loginForm.style.display = tab.dataset.tab === 'login' ? 'flex' : 'none';
      registerForm.style.display = tab.dataset.tab === 'register' ? 'flex' : 'none';
    });
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      currentUser = user.email;
      localStorage.setItem('currentUser', currentUser);
      updateAuthUI();
      authModal.style.display = 'none';
      alert('Login realizado com sucesso!');
    } else {
      alert('Email ou senha incorretos.');
    }
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    const confirm = e.target[2].value;
    if (password !== confirm) {
      alert('Senhas não coincidem.');
      return;
    }
    if (users.find(u => u.email === email)) {
      alert('Email já cadastrado.');
      return;
    }
    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Cadastro realizado! Faça login.');
    // Switch to login
    authTabs[0].click();
  });

  authBtn.addEventListener('click', () => {
    authModal.style.display = 'block';
  });

  closes.forEach(close => close.addEventListener('click', () => {
    authModal.style.display = 'none';
  }));

  // Logout
  authBtn.addEventListener('dblclick', () => {
    if (currentUser) {
      currentUser = null;
      localStorage.removeItem('currentUser');
      updateAuthUI();
    }
  });

  // Category Filter
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;
      document.querySelectorAll('.product-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Cart
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const cartBtn = document.getElementById('cart-btn');
  const cartModal = document.getElementById('cart-modal');
  const cartCount = document.getElementById('cart-count');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  function updateCartUI() {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    let total = 0;
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${products.find(p => p.id == item.id).img}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div>$${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
        </div>
        <button class="remove-item" onclick="removeFromCart(${item.id})">Remover</button>
      </div>
    `).join('');
    total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    cartTotal.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  window.updateQty = (id, delta) => {
    const item = cart.find(item => item.id === id);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
      updateCartUI();
    }
  };

  window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
  };

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const product = products.find(p => p.id === id);
      const item = cart.find(item => item.id === id);
      if (item) {
        item.qty += 1;
      } else {
        cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
      }
      updateCartUI();
      btn.textContent = 'Adicionado!';
      setTimeout(() => btn.textContent = 'Adicionar ao Carrinho', 1000);
    });
  });

  cartBtn.addEventListener('click', () => cartModal.style.display = 'block');
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Carrinho vazio.');
      return;
    }
    alert(`Compra finalizada! Total: $${cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2)}`);
    cart = [];
    updateCartUI();
    cartModal.style.display = 'none';
  });

  // Close modals on outside click
  window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  };

  // Init
  updateAuthUI();
  updateCartUI();
});
