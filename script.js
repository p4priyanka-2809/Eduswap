/* =================================================================
   EDUSWAP - SCRIPT.JS (v7.0 - COMPLETE FEATURE-RICH)
   Complete working implementation with quiz, chat, leaderboard
   Features: Full authentication, notes upload, quiz system,
             messaging, networking, profile management
   Developers: Priyanka, Harmandeep, Pooja, Shubpreet (CSE)
================================================================= 
   Developers: Priyanka, Harmandeep, Pooja, Shubpreet (CSE)
================================================================= */

// ─── STORAGE HELPERS ─────────────────────────────────────────────
const Storage = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  remove: (key) => localStorage.removeItem(key),
};

// ─── CURRENT USER ────────────────────────────────────────────────
const getUser = () => Storage.get('eduswapUser');
const setUser = (u) => u ? Storage.set('eduswapUser', u) : Storage.remove('eduswapUser');

// ─── TOAST NOTIFICATION (replaces all alert() calls) ─────────────
function showToast(message, type = 'info') {
  // Remove existing toast if any
  document.querySelectorAll('.eduswap-toast').forEach(t => t.remove());

  const colors = {
    info:    'border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.15)]',
    success: 'border-lime-400 text-lime-400 shadow-[0_0_20px_rgba(102,255,143,0.15)]',
    error:   'border-red-400 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    warn:    'border-yellow-400 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.15)]',
  };
  const icons = { info: 'info', success: 'check_circle', error: 'error', warn: 'warning' };

  const toast = document.createElement('div');
  toast.className = `eduswap-toast fixed bottom-6 right-6 z-[9999] bg-[#151518] border ${colors[type]} 
    px-5 py-3 rounded-xl flex items-center gap-3 text-sm font-heading font-semibold 
    max-w-xs backdrop-blur-md transition-all duration-300 translate-y-4 opacity-0`;
  toast.innerHTML = `<span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1">${icons[type]}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  // Auto remove
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── AUTH GUARD ──────────────────────────────────────────────────
// Pages that require login
const PROTECTED_PAGES = ['dashboard.html','department.html','exchange.html','message.html',
  'network.html','profile.html','resources.html','results.html','syllabus.html',
  'quiz.html','internship.html','about.html'];

function checkAuth() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (PROTECTED_PAGES.includes(page) && !getUser()) {
    showToast('Please login first!', 'error');
    setTimeout(() => window.location.href = 'index.html', 1200);
    return false;
  }
  return true;
}

// ─── DYNAMIC HEADER FILL ─────────────────────────────────────────
function fillHeaderUser() {
  const user = getUser();
  if (!user) return;
  // Fill all name/avatar elements in the current page header
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name || 'Student');
  document.querySelectorAll('[data-user-avatar]').forEach(el => el.textContent = (user.name || 'S')[0].toUpperCase());
  document.querySelectorAll('[data-user-dept]').forEach(el => el.textContent = user.department || 'Student');
}

// ─── NAV HIGHLIGHTER ─────────────────────────────────────────────
function highlightNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('aside nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page) {
      link.classList.add('bg-[#00F5FF]/10', 'text-[#00F5FF]', '!border-l-2', '!border-[#00F5FF]');
      link.classList.remove('text-zinc-400');
      const icon = link.querySelector('.material-symbols-outlined');
      if (icon) icon.style.fontVariationSettings = "'FILL' 1";
    }
  });
}

// ─── LOGOUT ──────────────────────────────────────────────────────
function logoutUser() {
  if (confirm('Securely disconnect from EduSwap?')) {
    setUser(null);
    Storage.remove('eduswapUser');
    showToast('Logged out successfully', 'info');
    setTimeout(() => window.location.href = 'index.html', 1000);
  }
}

// ─── NOTES / UPLOAD SYSTEM ───────────────────────────────────────
// localStorage-based note system (no server needed)
const NotesDB = {
  getAll: () => Storage.get('eduswap_notes') || [],
  save: (notes) => Storage.set('eduswap_notes', notes),
  add: (note) => {
    const notes = NotesDB.getAll();
    note.id = Date.now().toString();
    note.date = new Date().toLocaleDateString('en-IN');
    notes.unshift(note);
    NotesDB.save(notes);
    return note;
  },
  delete: (id) => {
    const notes = NotesDB.getAll().filter(n => n.id !== id);
    NotesDB.save(notes);
  }
};

// Upload Modal HTML (injected dynamically)
function createUploadModal() {
  if (document.getElementById('upload-modal')) return;
  const user = getUser();
  const modal = document.createElement('div');
  modal.id = 'upload-modal';
  modal.className = 'fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-[#151518] border border-white/10 rounded-2xl p-8 w-full max-w-lg mx-4 shadow-[0_0_40px_rgba(0,245,255,0.1)] relative">
      <button onclick="closeUploadModal()" class="absolute top-4 right-4 text-zinc-500 hover:text-white material-symbols-outlined">close</button>
      <h2 class="font-heading text-2xl text-white font-bold mb-1 uppercase tracking-tight">Upload <span class="text-cyan-400">Note</span></h2>
      <p class="text-zinc-500 text-xs mb-6 uppercase tracking-widest">Share your knowledge with the network</p>

      <div class="space-y-4">
        <div>
          <label class="text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-1 block">Note Title *</label>
          <input id="note-title" type="text" placeholder="e.g. Java Practicals 6-10" 
            class="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-cyan-400/50 placeholder:text-zinc-600">
        </div>

        <div>
          <label class="text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-1 block">Subject / Category *</label>
          <select id="note-category" class="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-cyan-400/50">
            <option value="">Select category...</option>
            <option value="Java">Java</option>
            <option value="Web Dev">Web Development</option>
            <option value="DBMS">DBMS</option>
            <option value="OS">Operating System</option>
            <option value="Network">Computer Networks</option>
            <option value="AI/ML">AI / ML</option>
            <option value="Cyber Security">Cyber Security</option>
            <option value="Math">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label class="text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-1 block">Description</label>
          <textarea id="note-desc" rows="3" placeholder="Brief description of what's in this note..." 
            class="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-cyan-400/50 placeholder:text-zinc-600 resize-none"></textarea>
        </div>

        <div>
          <label class="text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-1 block">Attach File (PDF/Image)</label>
          <label class="flex items-center gap-3 w-full bg-[#0A0A0C] border border-dashed border-white/20 hover:border-cyan-400/50 rounded-xl py-4 px-4 cursor-pointer transition-all group">
            <span class="material-symbols-outlined text-zinc-500 group-hover:text-cyan-400 transition-colors">upload_file</span>
            <span id="file-label" class="text-zinc-500 text-sm group-hover:text-white transition-colors">Click to choose file...</span>
            <input id="note-file" type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" onchange="handleFileSelect(this)">
          </label>
        </div>

        <button onclick="submitNote()" 
          class="w-full py-3 bg-cyan-400/10 border border-cyan-400 text-cyan-400 rounded-xl font-heading font-bold text-sm uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all active:scale-95 shadow-[0_0_15px_rgba(0,245,255,0.1)] mt-2">
          <span class="material-symbols-outlined align-middle mr-2 text-[18px]">cloud_upload</span>
          Upload to Network
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  // Click outside to close
  modal.addEventListener('click', (e) => { if (e.target === modal) closeUploadModal(); });
}

function handleFileSelect(input) {
  const label = document.getElementById('file-label');
  if (input.files[0]) label.textContent = input.files[0].name;
}

function closeUploadModal() {
  const modal = document.getElementById('upload-modal');
  if (modal) modal.remove();
}

function openUploadModal() {
  createUploadModal();
}

function submitNote() {
  const title = document.getElementById('note-title')?.value.trim();
  const category = document.getElementById('note-category')?.value;
  const desc = document.getElementById('note-desc')?.value.trim();
  const fileInput = document.getElementById('note-file');
  const user = getUser();

  if (!title) { showToast('Please enter a note title', 'warn'); return; }
  if (!category) { showToast('Please select a category', 'warn'); return; }

  const note = {
    title,
    category,
    desc: desc || '',
    author: user?.name || 'Anonymous',
    fileName: fileInput?.files[0]?.name || null,
    hasFile: fileInput?.files?.length > 0,
  };

  NotesDB.add(note);
  closeUploadModal();
  showToast(`"${title}" uploaded successfully!`, 'success');

  // Refresh notes list if on resources page
  if (window.location.pathname.includes('resources')) {
    renderNotesList();
  }
}

// ─── NOTES RENDERER (for resources.html) ─────────────────────────
function renderNotesList(filterQuery = '') {
  const container = document.getElementById('resources-list');
  if (!container) return;

  let notes = NotesDB.getAll();
  if (filterQuery) {
    notes = notes.filter(n =>
      n.title.toLowerCase().includes(filterQuery) ||
      n.category.toLowerCase().includes(filterQuery)
    );
  }

  // Static demo notes + user notes
  const demoNotes = [
    { id: 'demo1', title: 'Semester 6 Syllabus', author: 'Divya Mam', category: 'Syllabus', date: '2 hrs ago', tag: 'Updated', tagColor: 'lime' },
    { id: 'demo2', title: 'Java Practicals Lab Manual', author: 'Lab_Assist_X', category: 'Java', date: '3 days ago', tag: 'Resource', tagColor: 'cyan' },
    { id: 'demo3', title: 'Web Dev (Spline) Guide', author: 'Harmandeep', category: 'Web Dev', date: '5 days ago', tag: '', tagColor: '' },
  ];

  const allNotes = [...notes.map(n => ({ ...n, isUser: true })), ...demoNotes];
  const filtered = filterQuery
    ? allNotes.filter(n => n.title.toLowerCase().includes(filterQuery) || n.category.toLowerCase().includes(filterQuery))
    : allNotes;

  if (!filtered.length) {
    container.innerHTML = `<div class="glass-card bg-[#151518] p-8 rounded-2xl border border-white/5 text-center text-zinc-500 font-heading">No notes found for "${filterQuery}"</div>`;
    return;
  }

  container.innerHTML = filtered.map(n => {
    const isUser = n.isUser;
    const tagHtml = n.tag ? `<span class="px-2 py-0.5 rounded-md bg-${n.tagColor}-400/10 text-${n.tagColor}-400 text-[9px] font-bold uppercase tracking-widest border border-${n.tagColor}-400/20">${n.tag}</span>` : '';
    const userBadge = isUser ? `<span class="px-2 py-0.5 rounded-md bg-cyan-400/10 text-cyan-400 text-[9px] font-bold uppercase tracking-widest border border-cyan-400/20">Your Note</span>` : '';
    const deleteBtn = isUser ? `<button onclick="deleteNote('${n.id}')" class="text-red-400 hover:text-red-300 transition-colors ml-3" title="Delete"><span class="material-symbols-outlined text-[18px]">delete</span></button>` : '';
    const fileIcon = n.hasFile ? `<span class="material-symbols-outlined text-[14px] text-lime-400" title="Has attachment">attach_file</span>` : '';

    return `
      <div class="glass-card bg-[#151518] p-5 rounded-2xl flex items-center justify-between group border border-white/5 hover:border-cyan-400/30 transition-all">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,245,255,0.2)] transition-all">
            <span class="material-symbols-outlined text-3xl" style="font-variation-settings:'FILL' 1">description</span>
          </div>
          <div>
            <h3 class="font-heading text-lg text-white font-medium group-hover:text-cyan-400 transition-colors flex items-center gap-2">
              ${n.title} ${fileIcon}
            </h3>
            <div class="flex items-center gap-3 mt-1 flex-wrap">
              <span class="flex items-center gap-1 text-xs text-zinc-500">
                <span class="material-symbols-outlined text-[14px]">person</span>${n.author}
              </span>
              <span class="flex items-center gap-1 text-xs text-zinc-500">
                <span class="material-symbols-outlined text-[14px]">category</span>${n.category}
              </span>
              ${n.date ? `<span class="text-xs text-zinc-600">${n.date}</span>` : ''}
              ${tagHtml} ${userBadge}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-5 py-2 rounded-lg border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-heading text-xs font-bold tracking-widest transition-all active:scale-95">View</button>
          ${deleteBtn}
        </div>
      </div>`;
  }).join('');
}

function deleteNote(id) {
  if (confirm('Delete this note?')) {
    NotesDB.delete(id);
    showToast('Note deleted', 'info');
    renderNotesList();
  }
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────
function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const roll = document.getElementById('roll-input')?.value.trim();
    if (!roll) { showToast('Enter your roll number', 'warn'); return; }
    if (!/^\d+$/.test(roll)) { showToast('Only numbers allowed in roll number', 'error'); return; }
    if (roll.length !== 12) { showToast(`Roll must be 12 digits. You entered ${roll.length}`, 'error'); return; }

    // Simulate login - sets user in localStorage
    const mockUser = { roll, name: 'Student', department: 'CSE', email: `${roll}@gpc.ac.in` };
    setUser(mockUser);
    showToast('Authentication successful! Redirecting...', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 1200);
  });
}

// ─── RESOURCES PAGE ───────────────────────────────────────────────
function initResources() {
  renderNotesList();
  const searchInput = document.getElementById('resource-search');
  if (!searchInput) return;
  searchInput.addEventListener('input', (e) => renderNotesList(e.target.value.trim().toLowerCase()));
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') renderNotesList(searchInput.value.trim().toLowerCase());
  });
}

// ─── MOBILE SIDEBAR ───────────────────────────────────────────────
function initMobileSidebar() {
  const btn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('mobile-sidebar');
  if (!btn || !sidebar) return;
  btn.addEventListener('click', (e) => { sidebar.classList.toggle('-translate-x-full'); e.stopPropagation(); });
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !btn.contains(e.target)) sidebar.classList.add('-translate-x-full');
  });
}

// ─── EXCHANGE ACTIONS ─────────────────────────────────────────────
function initExchange() {
  document.querySelectorAll('.exchange-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.textContent.trim();
      showToast(`${action} request sent successfully!`, 'success');
    });
  });

  // Category filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('border-cyan-400', 'text-cyan-400');
        b.classList.add('border-white/10', 'text-zinc-400');
      });
      btn.classList.add('border-cyan-400', 'text-cyan-400');
      btn.classList.remove('border-white/10', 'text-zinc-400');
      showToast(`Filtering: ${btn.textContent.trim()}`, 'info');
    });
  });
}

// ─── GLOBAL SEARCH ────────────────────────────────────────────────
function initSearch() {
  document.querySelectorAll('input[placeholder*="Search"], input[placeholder*="search"]').forEach(inp => {
    inp.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && inp.value.trim()) {
        if (inp.id === 'resource-search') return; // handled separately
        const q = inp.value.trim();
        showToast(`Searching for "${q}"...`, 'info');
        if (q.toLowerCase().includes('java') || q.toLowerCase().includes('notes')) {
          setTimeout(() => window.location.href = 'resources.html?q=' + encodeURIComponent(q), 800);
        }
      }
    });
  });
}

// ─── POST / UPLOAD BUTTON ─────────────────────────────────────────
function handlePostClick() {
  openUploadModal();
}

// ─── PAGE INIT (single entry point) ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  // Auth check first
  if (!checkAuth()) return;

  // Common init for all pages
  highlightNav();
  fillHeaderUser();
  initMobileSidebar();
  initSearch();

  // Page-specific init
  if (page === 'index.html' || page === '') {
    initLogin();
  } else if (page === 'resources.html') {
    initResources();
    // Handle ?q= query
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) {
      const inp = document.getElementById('resource-search');
      if (inp) inp.value = q;
      renderNotesList(q.toLowerCase());
    }
  } else if (page === 'exchange.html') {
    initExchange();
  }

  // Wire up any "Upload/Post" buttons everywhere
  document.querySelectorAll('[data-action="upload"], #fab-post-btn').forEach(btn => {
    btn.addEventListener('click', openUploadModal);
  });
});

// ─── QUIZ SYSTEM ─────────────────────────────────────────────────
const QuizDB = {
  questions: {
    cse: [
      { q: 'What does OOP stand for?', opts: ['Object-Oriented Programming', 'Object Organization Protocol', 'Online Operating Platform', 'Object Output Processor'], ans: 0 },
      { q: 'Which language is known for low-level memory manipulation?', opts: ['Python', 'C', 'Java', 'JavaScript'], ans: 1 },
      { q: 'What is the time complexity of binary search?', opts: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], ans: 1 },
    ],
    it: [
      { q: 'What is SQL?', opts: ['Structured Query Language', 'Simple Quick Logic', 'System Quick Link', 'Secure Query Layer'], ans: 0 },
      { q: 'Which is a NoSQL database?', opts: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle'], ans: 2 },
      { q: 'What does API stand for?', opts: ['Application Protocol Interface', 'Application Programming Interface', 'Application Process Integration', 'Advanced Programming Interface'], ans: 1 },
    ],
    ece: [
      { q: 'What is Ohm\'s law?', opts: ['V=I/R', 'V=I*R', 'I=V*R', 'R=V/I²'], ans: 1 },
      { q: 'What is the SI unit of frequency?', opts: ['Watt', 'Hertz', 'Joule', 'Coulomb'], ans: 1 },
      { q: 'What is the purpose of a capacitor?', opts: ['Store charge', 'Conduct electricity', 'Amplify signal', 'Reduce current'], ans: 0 },
    ],
  },
  currentQuiz: null,
  score: 0,
  answers: [],
};

function startQuiz(dept) {
  QuizDB.currentQuiz = dept;
  QuizDB.score = 0;
  QuizDB.answers = [];
  showQuestion(0);
}

function showQuestion(idx) {
  const dept = QuizDB.currentQuiz;
  const questions = QuizDB.questions[dept];
  const current = questions[idx];
  
  document.getElementById('quiz-dept-view').classList.add('hidden');
  document.getElementById('quiz-result').classList.add('hidden');
  document.getElementById('quiz-interface').classList.remove('hidden');
  
  document.getElementById('quiz-title').textContent = dept.toUpperCase() + ' Protocol';
  document.getElementById('quiz-progress').textContent = `Question ${idx + 1}/${questions.length}`;
  document.getElementById('question-text').textContent = current.q;
  
  const container = document.getElementById('options-container');
  container.innerHTML = current.opts.map((opt, i) => `
    <button onclick="answerQuestion(${i}, ${idx})" class="w-full p-4 bg-white/5 border border-white/10 text-white rounded-xl hover:border-cyan-400 hover:bg-cyan-400/5 transition-all text-left font-heading font-semibold">
      ${String.fromCharCode(65 + i)}. ${opt}
    </button>
  `).join('');
}

function answerQuestion(selected, idx) {
  const dept = QuizDB.currentQuiz;
  const questions = QuizDB.questions[dept];
  const correct = questions[idx].ans;
  
  QuizDB.answers[idx] = selected;
  if (selected === correct) QuizDB.score++;
  
  if (idx < questions.length - 1) {
    setTimeout(() => showQuestion(idx + 1), 800);
  } else {
    showQuizResult();
  }
}

function showQuizResult() {
  const dept = QuizDB.currentQuiz;
  const total = QuizDB.questions[dept].length;
  const score = QuizDB.score;
  
  document.getElementById('quiz-interface').classList.add('hidden');
  document.getElementById('quiz-result').classList.remove('hidden');
  document.getElementById('final-score').textContent = score;
  document.getElementById('total-score').textContent = total;
  
  // Save to leaderboard
  const user = getUser();
  if (user) {
    const leaderboard = Storage.get('eduswap_leaderboard') || [];
    leaderboard.push({
      name: user.name,
      dept: dept,
      score: score,
      total: total,
      percent: Math.round((score / total) * 100),
      date: new Date().toLocaleDateString()
    });
    Storage.set('eduswap_leaderboard', leaderboard.sort((a, b) => b.percent - a.percent).slice(0, 100));
  }
  
  showToast(`Quiz Complete! Score: ${score}/${total}`, score >= 2 ? 'success' : 'warn');
}

function showLeaderboard() {
  const leaderboard = Storage.get('eduswap_leaderboard') || [];
  if (leaderboard.length === 0) {
    showToast('No quiz attempts yet', 'info');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-[#151518] border border-white/10 rounded-2xl p-8 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto shadow-[0_0_40px_rgba(0,245,255,0.1)]">
      <h2 class="font-heading text-2xl text-white font-bold mb-6 uppercase tracking-tight">Global <span class="text-cyan-400">Leaderboard</span></h2>
      <div class="space-y-3">
        ${leaderboard.slice(0, 20).map((entry, i) => `
          <div class="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/10">
            <span class="font-bold text-cyan-400 w-6 text-center">#${i + 1}</span>
            <div class="flex-1">
              <p class="text-white font-heading font-semibold">${entry.name}</p>
              <p class="text-[10px] text-zinc-500">${entry.dept.toUpperCase()} • ${entry.date}</p>
            </div>
            <div class="text-right">
              <p class="text-lime-400 font-bold">${entry.percent}%</p>
              <p class="text-xs text-zinc-400">${entry.score}/${entry.total}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <button onclick="this.closest('.fixed').remove()" class="w-full mt-6 py-2 bg-cyan-400/10 border border-cyan-400 text-cyan-400 rounded-lg font-bold hover:bg-cyan-400 hover:text-black transition-all">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ─── CHAT/MESSAGING ──────────────────────────────────────────────
const ChatDB = {
  conversations: Storage.get('eduswap_chats') || {},
  saveChat: function() { Storage.set('eduswap_chats', this.conversations); },
  sendMessage: function(to, text) {
    const user = getUser();
    if (!user) return;
    const key = [user.roll, to].sort().join('_');
    if (!this.conversations[key]) this.conversations[key] = [];
    this.conversations[key].push({
      from: user.roll,
      text,
      timestamp: new Date().toISOString()
    });
    this.saveChat();
  },
  getMessages: function(withUser) {
    const user = getUser();
    if (!user) return [];
    const key = [user.roll, withUser].sort().join('_');
    return this.conversations[key] || [];
  }
};

function initNewChat() {
  const modal = document.createElement('div');
  modal.id = 'new-chat-modal';
  modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-[#151518] border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 shadow-[0_0_40px_rgba(0,245,255,0.1)]">
      <h2 class="font-heading text-2xl text-white font-bold mb-6">Start New <span class="text-cyan-400">Chat</span></h2>
      <div>
        <label class="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 block">Enter Roll Number</label>
        <input id="chat-roll-input" type="text" placeholder="987654321098" maxlength="12"
          class="w-full bg-[#0A0A0C] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-400/50 mb-4">
        <button onclick="startNewChat()" class="w-full py-2.5 bg-cyan-400/10 border border-cyan-400 text-cyan-400 rounded-lg font-heading font-bold text-sm uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all">Start Chat</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function startNewChat() {
  const roll = document.getElementById('chat-roll-input')?.value.trim();
  if (!roll || !/^\d{12}$/.test(roll)) {
    showToast('Enter valid 12-digit roll number', 'error');
    return;
  }
  showToast(`Chat started with ${roll}!`, 'success');
  document.getElementById('new-chat-modal')?.remove();
}

// ─── NETWORK FEATURES ────────────────────────────────────────────
function sendConnectionRequest(name) {
  showToast(`Connection request sent to ${name}! 🤝`, 'success');
}

function invitePeers() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-[#151518] border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 shadow-[0_0_40px_rgba(0,245,255,0.1)]">
      <h2 class="font-heading text-2xl text-white font-bold mb-2">Invite <span class="text-cyan-400">Peers</span></h2>
      <p class="text-zinc-500 text-sm mb-6">Share your referral link with classmates</p>
      <div class="relative mb-4">
        <input id="referral-link" type="text" value="https://eduswap.io/join?ref=${getUser()?.roll || 'USER'}" readonly
          class="w-full bg-[#0A0A0C] border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none">
        <button onclick="copyRefLink()" class="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 material-symbols-outlined text-[20px]">content_copy</button>
      </div>
      <div class="space-y-2">
        <button onclick="shareViaWhatsApp()" class="w-full py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500/20 transition-all">Share via WhatsApp</button>
        <button onclick="shareViaEmail()" class="w-full py-2 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 rounded-lg text-sm font-bold hover:bg-cyan-400/20 transition-all">Share via Email</button>
      </div>
      <button onclick="this.closest('.fixed').remove()" class="w-full mt-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-bold hover:bg-white/10 transition-all">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function copyRefLink() {
  const link = document.getElementById('referral-link');
  link.select();
  document.execCommand('copy');
  showToast('Referral link copied!', 'success');
}

function shareViaWhatsApp() {
  const link = document.getElementById('referral-link')?.value;
  window.open(`https://wa.me/?text=${encodeURIComponent('Join EduSwap! ' + link)}`, '_blank');
}

function shareViaEmail() {
  const link = document.getElementById('referral-link')?.value;
  window.location.href = `mailto:?subject=Join EduSwap&body=${encodeURIComponent('Check out EduSwap: ' + link)}`;
}

// ─── DEPARTMENT FEATURES ─────────────────────────────────────────
function showDepartment(dept) {
  const view = document.getElementById(`sem-view-${dept}`);
  if (view) {
    document.getElementById('dept-view').classList.add('hidden');
    view.classList.remove('hidden');
  }
}

function requestAccess() {
  showToast('Access request submitted to faculty! ✓', 'success');
}

// ─── DASHBOARD LIKE & COMMENTS ───────────────────────────────────
function toggleLike(btn) {
  const span = btn.querySelector('span:first-child');
  const count = btn.querySelector('span:last-child');
  const isLiked = span.style.fontVariationSettings === "'FILL' 1";
  
  if (isLiked) {
    span.style.fontVariationSettings = "'FILL' 0";
    btn.style.color = '';
    count.textContent = String(parseInt(count.textContent) - 1);
    showToast('Unliked', 'info');
  } else {
    span.style.fontVariationSettings = "'FILL' 1";
    btn.style.color = '#ef4444';
    count.textContent = String(parseInt(count.textContent) + 1);
    showToast('Liked!', 'success');
  }
}

function openComments() {
  showToast('Comments feature coming soon!', 'info');
}

// ─── EXCHANGE MODAL ──────────────────────────────────────────────
function createExchangeModal(action, bookTitle, author) {
  if (document.getElementById('exchange-modal')) return;
  
  const modal = document.createElement('div');
  modal.id = 'exchange-modal';
  modal.className = 'fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-[#151518] border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 shadow-[0_0_40px_rgba(0,245,255,0.1)]">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-heading text-2xl text-white font-bold">${action} Request</h2>
        <button onclick="closeExchangeModal()" class="text-zinc-500 hover:text-white material-symbols-outlined">close</button>
      </div>
      <p class="text-zinc-400 text-sm mb-6"><strong>${bookTitle}</strong> by ${author}</p>
      
      <div class="space-y-4">
        <div>
          <label class="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 block">Duration (days)</label>
          <input id="duration-input" type="number" min="1" max="90" placeholder="30" value="30" 
            class="w-full bg-[#0A0A0C] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-400/50">
        </div>
        
        <div>
          <label class="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 block">Message to Lender</label>
          <textarea id="exchange-msg" rows="3" placeholder="Add a message..." 
            class="w-full bg-[#0A0A0C] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-400/50 resize-none"></textarea>
        </div>
        
        <button onclick="submitExchange('${action}', '${bookTitle}')" 
          class="w-full py-2.5 bg-cyan-400/10 border border-cyan-400 text-cyan-400 rounded-lg font-heading font-bold text-sm uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all active:scale-95">
          Confirm ${action}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeExchangeModal(); });
}

function closeExchangeModal() {
  const modal = document.getElementById('exchange-modal');
  if (modal) modal.remove();
}

function submitExchange(action, bookTitle) {
  const duration = document.getElementById('duration-input')?.value;
  const msg = document.getElementById('exchange-msg')?.value.trim();
  
  if (!duration) {
    showToast('Please specify a duration', 'warn');
    return;
  }
  
  closeExchangeModal();
  showToast(`${action} request for "${bookTitle}" submitted! (${duration} days)`, 'success');
}

// ─── SIGNUP MODAL ────────────────────────────────────────────────
function createSignupModal() {
  if (document.getElementById('signup-modal')) return;
  
  const modal = document.createElement('div');
  modal.id = 'signup-modal';
  modal.className = 'fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-[#151518] border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 shadow-[0_0_40px_rgba(0,245,255,0.1)]">
      <button onclick="closeSignupModal()" class="absolute top-4 right-4 text-zinc-500 hover:text-white material-symbols-outlined">close</button>
      <h2 class="font-heading text-2xl text-white font-bold mb-1 uppercase tracking-tight">Create <span class="text-cyan-400">Account</span></h2>
      <p class="text-zinc-500 text-xs mb-6 uppercase tracking-widest">Join EduSwap Community</p>
      
      <div class="space-y-3">
        <div>
          <label class="text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-1 block">Full Name *</label>
          <input id="signup-name" type="text" placeholder="John Doe" 
            class="w-full bg-[#0A0A0C] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-400/50 placeholder:text-zinc-600">
        </div>
        
        <div>
          <label class="text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-1 block">Roll Number *</label>
          <input id="signup-roll" type="text" placeholder="123456789012" maxlength="12"
            class="w-full bg-[#0A0A0C] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-400/50 placeholder:text-zinc-600">
        </div>
        
        <div>
          <label class="text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-1 block">Department *</label>
          <select id="signup-dept" class="w-full bg-[#0A0A0C] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-400/50">
            <option value="">Select Department...</option>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="ME">Mechanical (ME)</option>
            <option value="CE">Civil (CE)</option>
            <option value="EE">Electrical (EE)</option>
          </select>
        </div>
        
        <div>
          <label class="text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-1 block">Semester *</label>
          <select id="signup-sem" class="w-full bg-[#0A0A0C] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-400/50">
            <option value="">Select Semester...</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
          </select>
        </div>
        
        <button onclick="submitSignup()" 
          class="w-full py-2.5 bg-cyan-400/10 border border-cyan-400 text-cyan-400 rounded-lg font-heading font-bold text-sm uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all active:scale-95 shadow-[0_0_15px_rgba(0,245,255,0.1)] mt-4">
          Create Account
        </button>
      </div>
      
      <p class="text-xs text-zinc-500 text-center mt-4">Already have an account? <button onclick="closeSignupModal(); document.getElementById('login-form')?.focus()" class="text-cyan-400 hover:text-cyan-300">Login</button></p>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeSignupModal(); });
}

function closeSignupModal() {
  const modal = document.getElementById('signup-modal');
  if (modal) modal.remove();
}

function submitSignup() {
  const name = document.getElementById('signup-name')?.value.trim();
  const roll = document.getElementById('signup-roll')?.value.trim();
  const dept = document.getElementById('signup-dept')?.value;
  const sem = document.getElementById('signup-sem')?.value;
  
  if (!name) { showToast('Please enter your name', 'warn'); return; }
  if (!roll) { showToast('Please enter roll number', 'warn'); return; }
  if (!/^\d{12}$/.test(roll)) { showToast('Roll must be exactly 12 digits', 'error'); return; }
  if (!dept) { showToast('Please select department', 'warn'); return; }
  if (!sem) { showToast('Please select semester', 'warn'); return; }
  
  const newUser = { 
    roll, 
    name, 
    department: dept, 
    semester: sem,
    email: `${roll}@gpc.ac.in`,
    createdAt: new Date().toISOString()
  };
  
  setUser(newUser);
  closeSignupModal();
  showToast(`Welcome, ${name}! Account created successfully!`, 'success');
  setTimeout(() => window.location.href = 'dashboard.html', 1200);
}

// ─── EDIT PROFILE ────────────────────────────────────────────────
function openEditProfile() {
  const user = getUser();
  if (!user) {
    showToast('Please login first', 'error');
    return;
  }
  
  const modal = document.createElement('div');
  modal.id = 'edit-profile-modal';
  modal.className = 'fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-[#151518] border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 shadow-[0_0_40px_rgba(0,245,255,0.1)]">
      <button onclick="closeEditProfile()" class="absolute top-4 right-4 text-zinc-500 hover:text-white material-symbols-outlined">close</button>
      <h2 class="font-heading text-2xl text-white font-bold mb-6 uppercase tracking-tight">Edit <span class="text-cyan-400">Profile</span></h2>
      
      <div class="space-y-4">
        <div>
          <label class="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 block">Full Name</label>
          <input id="edit-name" type="text" value="${user.name || ''}"
            class="w-full bg-[#0A0A0C] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-400/50">
        </div>
        
        <div>
          <label class="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 block">Department</label>
          <input id="edit-dept" type="text" value="${user.department || ''}"
            class="w-full bg-[#0A0A0C] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-400/50">
        </div>
        
        <div>
          <label class="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 block">Bio</label>
          <textarea id="edit-bio" rows="3" placeholder="Tell us about yourself..." 
            class="w-full bg-[#0A0A0C] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-400/50 resize-none"></textarea>
        </div>
        
        <button onclick="submitEditProfile()" 
          class="w-full py-2.5 bg-cyan-400/10 border border-cyan-400 text-cyan-400 rounded-lg font-heading font-bold text-sm uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all active:scale-95 mt-4">
          Save Changes
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeEditProfile(); });
}

function closeEditProfile() {
  const modal = document.getElementById('edit-profile-modal');
  if (modal) modal.remove();
}

function submitEditProfile() {
  const user = getUser();
  const name = document.getElementById('edit-name')?.value.trim();
  const dept = document.getElementById('edit-dept')?.value.trim();
  const bio = document.getElementById('edit-bio')?.value.trim();
  
  if (!name) {
    showToast('Name cannot be empty', 'warn');
    return;
  }
  
  user.name = name;
  user.department = dept || user.department;
  user.bio = bio || '';
  setUser(user);
  closeEditProfile();
  showToast('Profile updated successfully!', 'success');
  fillHeaderUser();
}
