/* =================================================================
   EDUSWAP - ULTIMATE MASTER SCRIPT (v4.0)
   Built for 13-Node Architecture
   Developers: Priyanka, Harmandeep, Pooja, Shubpreet (CSE)
================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DYNAMIC MENU HIGHLIGHTER ---
    // Tum jis bhi 13 mein se jis page par hogi, ye usko left menu mein highlight karega
    let currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "") currentPage = "index.html"; // Default to index
    
    const navLinks = document.querySelectorAll("aside nav a");
    navLinks.forEach(link => {
        let linkHref = link.getAttribute("href");
        if (linkHref === currentPage) {
            // Active state styling (Cyan Border & Text)
            link.classList.add("bg-[#00F5FF]/10", "border-r-4", "border-[#00F5FF]", "text-[#00F5FF]");
            link.classList.remove("text-zinc-400");
            
            // Icon ko bhi solid color do
            let icon = link.querySelector('.material-symbols-outlined');
            if(icon) icon.style.fontVariationSettings = "'FILL' 1";
        }
    });

    // --- 2. 12-DIGIT HIGH SECURITY LOGIN (For index.html) ---
    const loginBtn = document.getElementById('login-btn') || document.querySelector('button[type="submit"]');
    if (loginBtn && (currentPage === 'index.html' || currentPage === '')) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const rollInput = document.querySelector('input[type="text"]');
            if(!rollInput) return;

            const roll = rollInput.value.trim();
            const isOnlyNumbers = /^\d+$/.test(roll); 
            
            if (roll === "") {
                alert("Terminal Error: Please enter your 12-digit Roll Number.");
            } else if (!isOnlyNumbers) {
                alert("ACCESS DENIED 🛑\nInvalid Input! Only numbers (0-9) are allowed.");
            } else if (roll.length !== 12) {
                alert(`ACCESS DENIED 🛑\nRoll number must be EXACTLY 12 digits.\nYou entered ${roll.length} digits.`);
            } else {
                alert("Authenticating Node... Connection Established! 🟢\nWelcome to EduSwap, Priyanka.");
                window.location.href = "dashboard.html";
            }
        });
    }

    // --- 3. GLOBAL SEARCH FUNCTION ---
    const searchInputs = document.querySelectorAll('input[placeholder*="Search"]');
    searchInputs.forEach(searchInput => {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim() !== "") {
                alert(`Initiating Global Sync: Searching EduSwap for "${searchInput.value}"...`);
                // Agar koi 'java' search kare toh resources par bhej do
                if(searchInput.value.toLowerCase().includes('java')) window.location.href = "resources.html";
            }
        });
    });

    // --- 4. LIKE / FAVORITE TOGGLE (Dil Lal Karna) ---
    // Dashboard aur Exchange pages ke liye
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const icon = this.querySelector('.material-symbols-outlined');
            if (icon) {
                const iconName = icon.innerText.trim();
                if (iconName === 'favorite') {
                    e.preventDefault();
                    if (this.style.color === 'rgb(239, 68, 68)' || this.style.color === 'red') { // Red
                        this.style.color = ''; 
                        icon.style.fontVariationSettings = "'FILL' 0";
                    } else {
                        this.style.color = '#ef4444'; // Tailwind Red-500
                        icon.style.fontVariationSettings = "'FILL' 1";
                        // Chota sa delay alert ke liye taaki UI pehle update ho
                        setTimeout(() => alert("Resource added to your encrypted favorites! ❤️"), 50);
                    }
                } 
            }
        });
    });

    // --- 5. NETWORK & EXCHANGE ACTIONS ---
    const actionBtns = document.querySelectorAll('.exchange-action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const action = btn.innerText.trim();
            alert(`Initiating ${action} Protocol... Request sent successfully!`);
        });
    });


});

/* =================================================================
   GLOBAL FUNCTIONS (Jo HTML mein onclick="" se call hote hain)
================================================================= */

// Universal Navigation
function goToPage(pageName) {
    window.location.href = pageName;
}

// Secure Logout
function logoutUser() {
    let confirmLogout = confirm("Are you sure you want to securely disconnect from EduSwap?");
    if (confirmLogout) {
        window.location.href = "index.html";
    }
}

// Upload/Post Button Logic (Dashboard side menu)
function handlePostClick() {
    alert("Terminal: File upload system is currently in read-only mode for this session.");
}

// =================================================================
// 7. MARKETPLACE (EXCHANGE) SMART ACTIONS
// Ye code Exchange page ke filters aur buttons ko zinda karega
// =================================================================

document.addEventListener('click', (e) => {
    // Jo bhi cheez click hui hai, uska text nikal lo
    let text = e.target.innerText.trim();

    // A. SELL & BORROW BUTTONS LOGIC
    if (text === 'Sell') {
        alert("Transaction Initiated: Preparing to SELL this asset on EduSwap.");
    } 
    else if (text === 'Borrow') {
        alert("Request Sent: Asking the owner for BORROW access.");
    } 
    
    // B. TOP BAR ACTIONS (Discover & Add Book)
    else if (text === 'Discover') {
        alert("Radar Active: Scanning global nodes for new resources...");
    }
    else if (text === 'List a Book' || text === 'add') {
        alert("Terminal Upload: Opening secure interface to list your resource.");
    }
    
    // C. CATEGORY FILTERS MAGIC (Color changing logic)
    const filterCategories = ['All Genres', 'Free', 'Paid', 'Exchange', 'Computer Science', 'Medicine', 'Art & Design'];
    
    // Agar click kiya gaya text in categories mein se ek hai
    if (filterCategories.includes(text)) {
        
        // Asli box dhoondo jo click hua hai
        let clickedBox = e.target.closest('.rounded-full') || e.target;
        
        // Us line mein jitne bhi filter boxes hain, unko dhundo aur unka Cyan rang hatao
        let parentDiv = clickedBox.parentElement;
        if (parentDiv) {
            let siblings = parentDiv.children;
            for (let sib of siblings) {
                sib.classList.remove('border-[#00F5FF]', 'text-[#00F5FF]', 'border-cyan-accent', 'text-cyan-accent');
                sib.classList.add('border-white/10', 'text-zinc-400');
            }
        }

        // Jo box click hua hai, usko wapas Cyan (Active) kar do
        clickedBox.classList.remove('border-white/10', 'text-zinc-400');
        clickedBox.classList.add('border-[#00F5FF]', 'text-[#00F5FF]');

        // Presentation ke liye ek mast alert
        alert(`Database Sync: Filtering marketplace for "${text}" resources...`);
    }
});

/* =================================================================
   EDUSWAP - FINAL MASTER SCRIPT (v5.0 - Mobile Ready)
   Developers: Priyanka & Team (CSE)
================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MOBILE RESPONSIVE HAMBURGER MENU ---
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('mobile-sidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', (e) => {
            sidebar.classList.toggle('-translate-x-full');
            e.stopPropagation(); 
        });

        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                sidebar.classList.add('-translate-x-full'); 
            }
        });
    }

    // --- 2. DYNAMIC MENU HIGHLIGHTER ---
    let currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "") currentPage = "index.html"; 
    
    const navLinks = document.querySelectorAll("aside nav a");
    navLinks.forEach(link => {
        let linkHref = link.getAttribute("href");
        if (linkHref === currentPage) {
            link.classList.add("bg-[#00F5FF]/10", "border-r-4", "border-[#00F5FF]", "text-[#00F5FF]");
            link.classList.remove("text-zinc-400");
            let icon = link.querySelector('.material-symbols-outlined');
            if(icon) icon.style.fontVariationSettings = "'FILL' 1";
        }
    });

    // --- 3. 12-DIGIT HIGH SECURITY LOGIN ---
    const loginBtn = document.getElementById('login-btn') || document.querySelector('button[type="submit"]');
    if (loginBtn && (currentPage === 'index.html' || currentPage === '')) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const rollInput = document.querySelector('input[type="text"]');
            if(!rollInput) return;

            const roll = rollInput.value.trim();
            const isOnlyNumbers = /^\d+$/.test(roll); 
            
            if (roll === "") alert("Terminal Error: Please enter your 12-digit Roll Number.");
            else if (!isOnlyNumbers) alert("ACCESS DENIED 🛑\nInvalid Input! Only numbers (0-9) are allowed.");
            else if (roll.length !== 12) alert(`ACCESS DENIED 🛑\nRoll number must be EXACTLY 12 digits.\nYou entered ${roll.length} digits.`);
            else {
                alert("Authenticating Node... Connection Established! 🟢\nWelcome to EduSwap, Priyanka.");
                window.location.href = "dashboard.html";
            }
        });
    }

    // --- 4. GLOBAL SEARCH FUNCTION ---
    const searchInputs = document.querySelectorAll('input[placeholder*="Search"]');
    searchInputs.forEach(searchInput => {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim() !== "") {
                alert(`Initiating Global Sync: Searching EduSwap for "${searchInput.value}"...`);
            }
        });
    });

    // --- 5. LIKE / FAVORITE TOGGLE ---
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const icon = this.querySelector('.material-symbols-outlined');
            if (icon && icon.innerText.trim() === 'favorite') {
                e.preventDefault();
                if (this.style.color === 'rgb(239, 68, 68)' || this.style.color === 'red') {
                    this.style.color = ''; 
                    icon.style.fontVariationSettings = "'FILL' 0";
                } else {
                    this.style.color = '#ef4444'; 
                    icon.style.fontVariationSettings = "'FILL' 1";
                }
            }
        });
    });

    

// --- 6. SMART LINK HANDLER (Updated) ---
    // Ye code check karega ki agar file sach mein folder mein hai toh use khol dega
    const smartNavLinks = document.querySelectorAll('aside nav a');
    
    smartNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            const comingSoon = ['internship.html', 'about.html'];
            
            if (href === '#' || comingSoon.includes(href)) {
                e.preventDefault(); // Rasta roko
                alert("🚀 EduSwap AI: This module is currently under development. Please check back later!");
            } else {
                // Agar file 'dashboard.html' ya 'resources.html' hai, toh ise normal chalne do
                console.log(`Navigating to: ${href}`);
            }
        });
    }); 
});




