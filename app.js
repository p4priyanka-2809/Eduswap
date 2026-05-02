// =================================================================
// EDUSWAP - FRONTEND PROTOTYPE SCRIPT (GitHub Pages Ready)
// =================================================================

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

// 1. HIGHLIGHT ACTIVE MENU ITEM
const highlightNav = () => {
  let currentPage = window.location.pathname.split('/').pop() || 'index.html';
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

// 2. FAKE GLOBAL SEARCH FOR PRESENTATION
const bindGlobalSearch = () => {
  const searchInputs = document.querySelectorAll('input[placeholder*="Search"], #resource-search');
  searchInputs.forEach(searchInput => {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        const query = searchInput.value.trim();
        showToast(`Initiating Global Sync: Searching EduSwap for "${query}"...`);
        
        // Agar resource search hai, toh resources page par bhej do
        if (searchInput.id === 'resource-search' || query.toLowerCase().includes('java')) {
          window.location.href = 'resources.html';
        }
      }
    });
  });
};

// 3. BYPASS LOGIN SYSTEM (No Server Required)
const initLoginPage = () => {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rollInput = document.getElementById('roll-input');
    if (!rollInput) return;
    const roll = rollInput.value.trim();

    if (!/^\d{12}$/.test(roll)) {
      showToast('ACCESS DENIED 🛑 Roll number must be exactly 12 digits.');
      return;
    }

    // Set Fake User Data for Session
    setCurrentRoll(roll);
    setCurrentUser({
        name: "Priyanka",
        department: "Computer Science Engineering",
        roll: roll,
        email: "Govt. Polytechnic College Patiala"
    });

    showToast('Authenticating Node... Connection Established! 🟢 Redirecting...');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
  });
};

// 4. PROFILE POPULATOR
const fillProfilePage = (user) => {
  const nameEl = document.getElementById('profile-name');
  const subtitleEl = document.getElementById('profile-subtitle');
  const titleEl = document.getElementById('profile-title');
  const deptEl = document.getElementById('profile-dept');
  const collegeEl = document.getElementById('profile-college');
  const avatarEl = document.getElementById('profile-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (subtitleEl) subtitleEl.textContent = user.department;
  if (titleEl) titleEl.textContent = user.name;
  if (deptEl) deptEl.textContent = user.department;
  if (collegeEl) collegeEl.textContent = user.email;
  if (avatarEl) avatarEl.textContent = user.name[0];
};

const loadProfilePage = () => {
  const user = getCurrentUser();
  if (user) fillProfilePage(user);
};

// 5. MESSAGE COMPOSER (Live UI updating for demo)
const initMessageComposer = () => {
  const sendButton = document.getElementById('send-message-btn');
  const input = document.getElementById('message-input');
  const threadContainer = document.getElementById('message-thread');

  if (!sendButton || !input || !threadContainer) return;

  sendButton.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) {
      showToast('Type a message first.');
      return;
    }

    // Add new message to UI dynamically
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsgHtml = `
        <div class="flex justify-end gap-3 max-w-[80%] ml-auto mt-4">
            <div class="bg-cyan-400/10 border border-cyan-400/30 rounded-2xl rounded-br-none p-4 shadow-[0_0_15px_rgba(0,245,255,0.05)]">
                <p class="text-sm text-white leading-relaxed">${text}</p>
                <p class="text-[9px] text-cyan-400/60 mt-2 text-right font-heading tracking-wider">${time} • Sent</p>
            </div>
        </div>
    `;
    threadContainer.insertAdjacentHTML('beforeend', newMsgHtml);
    input.value = '';

    // Scroll to bottom
    threadContainer.scrollTop = threadContainer.scrollHeight;
  });
};

// 6. SMART LINKS & MOBILE MENU
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

// 7. GLOBAL ACTIONS
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

const goToPage = (pageName) => {
  window.location.href = pageName;
};

// 8. INITIALIZE EVERYTHING
const pageInit = () => {
  highlightNav();
  bindGlobalSearch();
  initSmartLinks();
  initMobileMenu();

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  if (currentPage === 'index.html' || currentPage === '') {
    initLoginPage();
  } else if (currentPage === 'profile.html') {
    loadProfilePage();
  } else if (currentPage === 'message.html') {
    initMessageComposer();
  }
};

window.addEventListener('DOMContentLoaded', pageInit);
