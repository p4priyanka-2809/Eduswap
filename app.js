const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api'
  : '/api';

const getCurrentRoll = () => localStorage.getItem('eduswapRoll') || '';
const setCurrentRoll = (roll) => {
  if (roll) localStorage.setItem('eduswapRoll', roll);
  else localStorage.removeItem('eduswapRoll');
};

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('eduswapUser')) || null;
  } catch {
    return null;
  }
};

const setCurrentUser = (user) => {
  if (user) localStorage.setItem('eduswapUser', JSON.stringify(user));
  else localStorage.removeItem('eduswapUser');
};

const showToast = (message) => {
  alert(message);
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw payload;
  return payload;
};

const highlightNav = () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('aside nav a').forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage) {
      link.classList.add('bg-[#00F5FF]/10', 'border-r-4', 'border-[#00F5FF]', 'text-[#00F5FF]');
      link.classList.remove('text-zinc-400');
      const icon = link.querySelector('.material-symbols-outlined');
      if (icon) icon.style.fontVariationSettings = "'FILL' 1";
    }
  });
};

const bindGlobalSearch = () => {
  const searchInputs = document.querySelectorAll('input[placeholder*="Search"], #resource-search');
  searchInputs.forEach(searchInput => {
    searchInput.addEventListener('keypress', async (e) => {
      if (e.key !== 'Enter' || searchInput.value.trim() === '') return;
      const query = searchInput.value.trim();
      if (searchInput.id === 'resource-search') {
        window.location.href = 'resources.html?q=' + encodeURIComponent(query);
        return;
      }
      try {
        const result = await fetchJson(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
        showToast(`${result.results.resources.length} resources and ${result.results.users.length} profiles found.`);
      } catch (err) {
        showToast(err.error || 'Search failed');
      }
    });
  });
};

const initLoginPage = () => {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rollInput = document.getElementById('roll-input');
    if (!rollInput) return;
    const roll = rollInput.value.trim();
    if (!/^\d{12}$/.test(roll)) {
      showToast('Roll number must be exactly 12 digits.');
      return;
    }
    try {
      const data = await fetchJson(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roll })
      });
      setCurrentRoll(data.user.roll);
      setCurrentUser(data.user);
      showToast('Authentication successful. Redirecting to dashboard...');
      window.location.href = 'dashboard.html';
    } catch (error) {
      showToast(error.error || 'Login failed');
    }
  });
};

const fillProfilePage = (user) => {
  const nameEl = document.getElementById('profile-name');
  const subtitleEl = document.getElementById('profile-subtitle');
  const titleEl = document.getElementById('profile-title');
  const deptEl = document.getElementById('profile-dept');
  const collegeEl = document.getElementById('profile-college');
  const avatarEl = document.getElementById('profile-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (subtitleEl) subtitleEl.textContent = user.department || 'Student';
  if (titleEl) titleEl.textContent = user.name;
  if (deptEl) deptEl.textContent = `${user.department || 'Department'}${user.year ? ' (' + user.year + ')' : ''}`;
  if (collegeEl) collegeEl.textContent = user.email || 'Govt. Polytechnic College Patiala';
  if (avatarEl) avatarEl.textContent = user.name ? user.name[0] : 'U';
};

const loadProfilePage = async () => {
  const currentRoll = getCurrentRoll();
  if (!currentRoll) {
    showToast('Please login first to view your profile.');
    return;
  }
  try {
    const result = await fetchJson(`${API_BASE}/profile/${currentRoll}`);
    fillProfilePage(result.user);
  } catch (err) {
    showToast(err.error || 'Unable to load profile');
  }
};

const renderResources = (resources) => {
  const container = document.getElementById('resources-list');
  if (!container) return;
  if (!resources.length) {
    container.innerHTML = '<div class="glass-card bg-dark-card p-6 rounded-2xl border border-white/5 text-zinc-400">No resources found.</div>';
    return;
  }
  container.innerHTML = resources.map(item => `
    <div class="glass-card bg-dark-card p-5 rounded-2xl flex items-center justify-between group border border-white/5 hover:border-cyan-400/30 transition-all cursor-pointer">
      <div class="flex items-center gap-5">
        <div class="w-14 h-14 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,245,255,0.2)] transition-all">
          <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">description</span>
        </div>
        <div>
          <h3 class="font-heading text-lg text-white font-medium group-hover:text-cyan-400 transition-colors">${item.title}</h3>
          <div class="flex items-center gap-4 mt-1 text-[11px] text-zinc-500">
            <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px]">person</span>${item.ownerRoll}</span>
            <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px]">category</span>${item.category}</span>
          </div>
        </div>
      </div>
      <button class="px-6 py-2.5 rounded-lg border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-heading text-xs font-bold tracking-widest transition-all active:scale-95">View</button>
    </div>
  `).join('');
};

const loadResourcesPage = async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const searchInput = document.getElementById('resource-search');
    if (searchInput && q) searchInput.value = q;
    const url = `${API_BASE}/resources${q ? `?q=${encodeURIComponent(q)}` : ''}`;
    const result = await fetchJson(url);
    renderResources(result.resources);
  } catch (err) {
    showToast(err.error || 'Unable to load resources');
  }
};

const loadMessagePage = async () => {
  const currentRoll = getCurrentRoll();
  if (!currentRoll) {
    showToast('Please login first to view messages.');
    return;
  }
  try {
    const result = await fetchJson(`${API_BASE}/messages/${currentRoll}`);
    const messages = result.messages || [];
    const listContainer = document.getElementById('message-contact-list');
    const threadContainer = document.getElementById('message-thread');
    if (!listContainer || !threadContainer) return;

    if (!messages.length) {
      listContainer.innerHTML = '<div class="text-sm text-zinc-400">No messages yet.</div>';
      threadContainer.innerHTML = '<div class="text-sm text-zinc-400">Start a new conversation from the left.</div>';
      return;
    }

    const contacts = [...new Set(messages.map(msg => (msg.from === currentRoll ? msg.to : msg.from)))];
    listContainer.innerHTML = contacts.map(contact => {
      const contactMessages = messages.filter(msg => msg.from === contact || msg.to === contact);
      const last = contactMessages[contactMessages.length - 1];
      return `
        <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer" data-contact="${contact}">
          <div class="relative">
            <div class="w-10 h-10 rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center font-bold text-cyan-400">${contact.charAt(0)}</div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-heading text-sm text-white font-semibold truncate">${contact}</p>
            <p class="text-[11px] text-zinc-400 truncate">${String(last.text).slice(0, 40)}</p>
          </div>
          <span class="text-[9px] text-cyan-400 font-bold uppercase">${new Date(last.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      `;
    }).join('');

    const activeContact = contacts[0];
    const activeThread = messages.filter(msg => msg.from === activeContact || msg.to === activeContact);
    threadContainer.innerHTML = activeThread.map(msg => {
      const isMine = msg.from === currentRoll;
      return `
        <div class="flex ${isMine ? 'justify-end' : 'justify-start'} gap-3 max-w-[80%] ${isMine ? 'ml-auto' : ''}">
          ${isMine ? `<div class="bg-cyan-400/10 border border-cyan-400/30 rounded-2xl rounded-br-none p-4 shadow-[0_0_15px_rgba(0,245,255,0.05)] text-sm text-white leading-relaxed">${msg.text}<p class="text-[9px] text-cyan-400/60 mt-2 text-right font-heading tracking-wider">${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>` : `<div class="w-8 h-8 rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center font-bold text-xs text-lime-400 flex-shrink-0 self-end">${msg.from.charAt(0)}</div><div class="bg-dark-bg border border-white/10 rounded-2xl rounded-bl-none p-4 shadow-md text-sm text-zinc-300 leading-relaxed">${msg.text}<p class="text-[9px] text-zinc-500 mt-2 font-heading tracking-wider">${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>`}
        </div>
      `;
    }).join('');
  } catch (err) {
    showToast(err.error || 'Unable to load messages');
  }
};

const initMessageComposer = () => {
  const sendButton = document.getElementById('send-message-btn');
  if (!sendButton) return;
  sendButton.addEventListener('click', async () => {
    const input = document.getElementById('message-input');
    const currentRoll = getCurrentRoll();
    if (!input || !currentRoll) return;
    const text = input.value.trim();
    if (!text) {
      showToast('Type a message first.');
      return;
    }
    try {
      await fetchJson(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: currentRoll, to: '987654321098', text })
      });
      input.value = '';
      showToast('Message sent.');
      loadMessagePage();
    } catch (err) {
      showToast(err.error || 'Could not send message');
    }
  });
};

const initResourcesPage = () => {
  const searchInput = document.getElementById('resource-search');
  if (!searchInput) return;
  searchInput.addEventListener('keypress', async (e) => {
    if (e.key !== 'Enter') return;
    const query = searchInput.value.trim();
    if (!query) return;
    try {
      const result = await fetchJson(`${API_BASE}/resources?q=${encodeURIComponent(query)}`);
      renderResources(result.resources);
    } catch (err) {
      showToast(err.error || 'Resource search failed');
    }
  });
};

const initSmartLinks = () => {
  document.querySelectorAll('aside nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const comingSoon = ['internship.html', 'about.html'];
      if (href === '#' || comingSoon.includes(href)) {
        e.preventDefault();
        showToast('🚀 EduSwap AI: This module is currently under development. Please check back later!');
      }
    });
  });
};

const initMobileMenu = () => {
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('mobile-sidebar');
  if (!menuBtn || !sidebar) return;
  menuBtn.addEventListener('click', (e) => {
    sidebar.classList.toggle('-translate-x-full');
    e.stopPropagation();
  });
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
      sidebar.classList.add('-translate-x-full');
    }
  });
};

const goToPage = (pageName) => {
  window.location.href = pageName;
};

const logoutUser = () => {
  const confirmLogout = confirm('Are you sure you want to securely disconnect from EduSwap?');
  if (confirmLogout) {
    setCurrentRoll('');
    setCurrentUser(null);
    window.location.href = 'index.html';
  }
};

const handlePostClick = () => {
  showToast('Terminal: File upload system is currently in read-only mode for this session.');
};

const pageInit = async () => {
  highlightNav();
  bindGlobalSearch();
  initSmartLinks();
  initMobileMenu();

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === 'index.html') {
    initLoginPage();
    return;
  }

  if (currentPage === 'profile.html') {
    await loadProfilePage();
    return;
  }

  if (currentPage === 'message.html') {
    await loadMessagePage();
    initMessageComposer();
    return;
  }

  if (currentPage === 'resources.html') {
    await loadResourcesPage();
    initResourcesPage();
    return;
  }
};

window.addEventListener('DOMContentLoaded', pageInit);
