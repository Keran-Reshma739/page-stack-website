/**
 * PageStack Engine - StackMart E-Commerce Platform v5.0
 * Manages 10-page browser history trajectory with LIFO (Last In, First Out) principle,
 * virtual memory hex address simulation, and HTML5 LocalStorage persistence.
 */
class PageStack {
    constructor() {
        this.storageKey = 'stackmart_page_history_v5';
        this.metricsKey = 'stackmart_page_metrics_v5';
        
        this.items = this.loadStack();
        this.metrics = this.loadMetrics();
    }

    loadStack() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load stack:', e);
            return [];
        }
    }

    saveStack() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
        } catch (e) {
            console.error('Failed to save stack:', e);
        }
    }

    loadMetrics() {
        try {
            const stored = localStorage.getItem(this.metricsKey);
            return stored ? JSON.parse(stored) : { pushes: 0, pops: 0, peak: 0, logs: [] };
        } catch (e) {
            return { pushes: 0, pops: 0, peak: 0, logs: [] };
        }
    }

    saveMetrics() {
        try {
            localStorage.setItem(this.metricsKey, JSON.stringify(this.metrics));
        } catch (e) {
            console.error('Failed to save metrics:', e);
        }
    }

    logEvent(action, pageName) {
        const timestamp = new Date().toLocaleTimeString();
        this.metrics.logs.unshift({ action, pageName, timestamp });
        if (this.metrics.logs.length > 20) this.metrics.logs.pop();
        this.saveMetrics();
    }

    // PUSH: Add visited page to top of stack
    push(page) {
        if (!page || !page.name || !page.url) return;
        
        this.items.push({
            ...page,
            timestamp: new Date().toLocaleTimeString(),
            id: 'node_' + Math.random().toString(36).substr(2, 6)
        });
        
        this.metrics.pushes++;
        if (this.items.length > this.metrics.peak) {
            this.metrics.peak = this.items.length;
        }
        
        this.logEvent('PUSH', page.name);
        this.saveStack();
        this.saveMetrics();
    }

    // POP: Remove and return top page
    pop() {
        if (this.isEmpty()) return null;
        
        const popped = this.items.pop();
        this.metrics.pops++;
        
        this.logEvent('POP', popped ? popped.name : 'Unknown');
        this.saveStack();
        this.saveMetrics();
        
        return popped;
    }

    // PEEK: Inspect top element
    peek() {
        if (this.isEmpty()) return null;
        return this.items[this.items.length - 1];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    display() {
        return [...this.items];
    }

    size() {
        return this.items.length;
    }

    getMetrics() {
        return { ...this.metrics };
    }

    clear() {
        this.items = [];
        this.metrics = { pushes: 0, pops: 0, peak: 0, logs: [] };
        this.saveStack();
        this.saveMetrics();
    }
}

// Global stack instance
const pageStack = new PageStack();

/**
 * 10 Pages Metadata Map for StackMart Store
 */
const PAGE_META = {
    'index.html': { name: 'Home', icon: '🛒', title: 'StackMart Storefront', subtitle: 'Next-Gen Electronics & Tech Store' },
    'products.html': { name: 'Catalog', icon: '📱', title: 'Tech Catalog', subtitle: 'Explore Laptops, Audio & Accessories' },
    'product-detail.html': { name: 'Detail', icon: '💻', title: 'Product Details', subtitle: 'ProBook Ultra 15" - Specs & Reviews' },
    'cart.html': { name: 'Cart', icon: '🛍️', title: 'Shopping Cart', subtitle: 'Order Summary & Checkout Preview' },
    'about.html': { name: 'About', icon: 'ℹ️', title: 'About StackMart', subtitle: 'Supply Chain & Logistics Network' },
    'services.html': { name: 'Services', icon: '⚙️', title: 'Store Services', subtitle: 'Warranty, Express Shipping & Support' },
    'gallery.html': { name: 'Gallery', icon: '🖼️', title: 'Showroom', subtitle: 'Product Unboxing & High-Res Gallery' },
    'blog.html': { name: 'Blog', icon: '📰', title: 'Tech Blog', subtitle: 'Buying Guides & Expert Reviews' },
    'contact.html': { name: 'Support', icon: '📞', title: 'Help Desk', subtitle: '24/7 Customer Service & Store Locator' },
    'profile.html': { name: 'Profile', icon: '👤', title: 'User Profile', subtitle: 'Account Dashboard & Session History' }
};

/**
 * 5 Primary Mobile Bottom Tabs
 */
const MOBILE_PRIMARY_TABS = [
    { file: 'index.html', name: 'Store', icon: '🛒' },
    { file: 'products.html', name: 'Catalog', icon: '📱' },
    { file: 'cart.html', name: 'Cart', icon: '🛍️' },
    { file: 'blog.html', name: 'Blog', icon: '📰' },
    { file: 'profile.html', name: 'Profile', icon: '👤' }
];

function getCurrentPageFilename() {
    let path = window.location.pathname;
    let filename = path.substring(path.lastIndexOf('/') + 1);
    if (!filename || filename === '' || filename === 'page-stack-website') {
        filename = 'index.html';
    }
    return filename;
}

function initPageStack() {
    const currentFilename = getCurrentPageFilename();
    const meta = PAGE_META[currentFilename] || { name: 'Store', icon: '🛒' };
    const currentPageObj = { name: meta.name, url: currentFilename, icon: meta.icon };

    if (pageStack.isEmpty()) {
        pageStack.push(currentPageObj);
    } else {
        const topPage = pageStack.peek();
        if (!topPage || topPage.url !== currentFilename) {
            pageStack.push(currentPageObj);
        }
    }

    injectMobileComponents();
    renderStackUI();
    bindEvents();
}

function injectMobileComponents() {
    if (document.getElementById('floating-stack-fab')) return;

    const currentFilename = getCurrentPageFilename();

    // 1. Mobile Bottom Tab Bar (5 Clean Primary Tabs)
    const bottomBarHtml = `
        <nav class="mobile-app-bottom-bar">
            ${MOBILE_PRIMARY_TABS.map(item => {
                const isActive = (item.file === currentFilename) ? 'active' : '';
                return `
                    <a href="${item.file}" class="mobile-app-tab ${isActive}" data-page="${item.name}">
                        <span class="tab-icon">${item.icon}</span>
                        <span class="tab-label">${item.name}</span>
                    </a>
                `;
            }).join('')}
        </nav>
    `;

    // 2. Floating Stack Action Button (FAB) at Bottom-Right
    const fabHtml = `
        <div id="floating-stack-fab" class="floating-stack-fab" title="Open Page History Stack (LIFO) Inspector">
            <span class="fab-icon">🥞</span>
            <span class="fab-text">Stack (LIFO)</span>
            <span class="fab-badge" id="fab-stack-depth">${pageStack.size()}</span>
        </div>
    `;

    // 3. Floating Pop-Up Stack Modal Container
    const modalHtml = `
        <div id="stack-modal-overlay" class="stack-modal-overlay">
            <div class="stack-modal-card">
                <div class="stack-modal-header">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.25rem;">🥞</span>
                        <strong style="font-size: 0.95rem; color: #0f172a; letter-spacing: -0.01em;">PAGE HISTORY STACK (LIFO)</strong>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.65rem;">
                        <span class="stack-counter" style="font-size: 0.78rem;">Depth: <span id="stack-size-count">0</span></span>
                        <button id="close-stack-modal" class="modal-close-btn">&times;</button>
                    </div>
                </div>

                <div style="padding: 1.1rem;">
                    <div class="control-actions" style="margin-bottom: 0.85rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <button class="btn btn-back">← Back (POP)</button>
                        <button class="btn btn-reset-stack">Reset Stack</button>
                    </div>

                    <div class="stats-row" style="margin-bottom: 0.85rem;">
                        <div class="stat-card">
                            <div class="stat-label">PUSHES</div>
                            <div class="stat-val" id="stat-push-count">0</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">POPS</div>
                            <div class="stat-val" id="stat-pop-count">0</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">PEAK SIZE</div>
                            <div class="stat-val" id="stat-peak-count">0</div>
                        </div>
                    </div>

                    <div class="stack-viewport" id="visual-stack-container" style="max-height: 220px; overflow-y: auto;"></div>

                    <div class="ds-inspector-card" style="margin-top: 0.85rem;">
                        <div class="ds-inspector-header">&lt;/&gt; Live Data Structure Inspector</div>
                        <div class="ds-line"><span class="ds-var">PageStack</span>.items[]:</div>
                        <div class="ds-line" id="ds-array-code" style="color: #38bdf8; font-size: 0.75rem;">items = [];</div>
                        <div class="ds-line" style="margin-top: 0.35rem;"><span class="ds-var">peek()</span> = <span class="ds-val" id="ds-peek-value">"Home"</span></div>
                        <div class="ds-line"><span class="ds-var">size()</span> = <span class="ds-val" id="ds-size-value">1</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = bottomBarHtml + fabHtml + modalHtml;
    document.body.appendChild(wrapper);

    // Wire Floating Modal Toggle
    const fab = document.getElementById('floating-stack-fab');
    const modal = document.getElementById('stack-modal-overlay');
    const closeBtn = document.getElementById('close-stack-modal');

    if (fab && modal) {
        fab.addEventListener('click', () => modal.classList.add('active'));
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}

function navigateToPage(pageName, url) {
    const topPage = pageStack.peek();
    if (!topPage || topPage.url !== url) {
        pageStack.push({ name: pageName, url: url, icon: PAGE_META[url] ? PAGE_META[url].icon : '📄' });
    }
    window.location.href = url;
}

function navigateBack() {
    if (pageStack.size() <= 1) {
        showToast('⚠️ Top of stack reached (Home page). Cannot pop further!');
        return;
    }

    const poppedPage = pageStack.pop();
    const newTopPage = pageStack.peek();

    if (newTopPage && newTopPage.url) {
        showToast(`⬅️ Popped [${poppedPage.name}]. Navigating to [${newTopPage.name}]`);
        setTimeout(() => {
            window.location.href = newTopPage.url;
        }, 150);
    }
}

function resetStack() {
    const currentFilename = getCurrentPageFilename();
    const meta = PAGE_META[currentFilename] || { name: 'Home', icon: '🛒' };
    
    pageStack.clear();
    pageStack.push({ name: meta.name, url: currentFilename, icon: meta.icon });
    
    renderStackUI();
    showToast('🔄 Stack history & session metrics reset!');
}

function showToast(message) {
    let toast = document.getElementById('stack-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'stack-toast';
        toast.className = 'stack-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function renderStackUI() {
    const stackItems = pageStack.display();
    const metrics = pageStack.getMetrics();
    const currentFilename = getCurrentPageFilename();
    const topItem = pageStack.peek();

    // 1. Back button state
    const backBtns = document.querySelectorAll('.btn-back');
    backBtns.forEach(btn => {
        if (pageStack.size() <= 1) {
            btn.classList.add('disabled');
            btn.setAttribute('disabled', 'disabled');
        } else {
            btn.classList.remove('disabled');
            btn.removeAttribute('disabled');
        }
    });

    // 2. Active links in Navbar & Mobile Tab Bar
    const navLinks = document.querySelectorAll('.nav-link, .mobile-app-tab');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentFilename) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 3. Floating FAB Badge Updates
    const fabBadge = document.getElementById('fab-stack-depth');
    if (fabBadge) fabBadge.textContent = pageStack.size();

    const mTopName = document.getElementById('m-top-name');
    if (mTopName) mTopName.textContent = topItem ? topItem.name : 'None';

    const mStackSize = document.getElementById('m-stack-size');
    if (mStackSize) mStackSize.textContent = pageStack.size();

    // 4. Render Visual Stack Memory Layer
    const container = document.getElementById('visual-stack-container');
    if (container) {
        if (stackItems.length === 0) {
            container.innerHTML = '<div class="stack-empty">Stack is empty</div>';
        } else {
            let html = '<div class="stack-items-wrapper">';
            
            for (let index = stackItems.length - 1; index >= 0; index--) {
                const item = stackItems[index];
                const isTop = (index === stackItems.length - 1);
                const isBottom = (index === 0);
                
                let itemClass = 'stack-item';
                if (isTop) itemClass += ' top-item';
                if (isBottom) itemClass += ' bottom-item';

                const memAddress = '0x' + (0x7FFF000 + index * 4).toString(16).toUpperCase();

                html += `
                    <div class="${itemClass}">
                        <div class="stack-item-meta">
                            <span class="mem-addr">${memAddress}</span>
                            <span class="stack-idx">[Idx ${index}]</span>
                        </div>
                        <div class="stack-item-main">
                            <span class="item-icon">${item.icon || '📄'}</span>
                            <div class="item-text">
                                <div class="item-name">${escapeHtml(item.name)}</div>
                                <div class="item-url">${escapeHtml(item.url)}</div>
                            </div>
                        </div>
                        <div class="stack-item-badges">
                            ${isTop ? '<span class="badge badge-top">👉 TOP [SP]</span>' : ''}
                            ${isBottom && !isTop ? '<span class="badge badge-bottom">BASE</span>' : ''}
                        </div>
                    </div>
                `;
            }
            html += '</div>';
            container.innerHTML = html;
        }
    }

    // 5. Update Inspector Terminal
    const arrayCodeElem = document.getElementById('ds-array-code');
    if (arrayCodeElem) {
        const names = stackItems.map(i => `"${i.name}"`);
        arrayCodeElem.textContent = `items = [ ${names.join(', ')} ];`;
    }

    const peekCodeElem = document.getElementById('ds-peek-value');
    if (peekCodeElem) {
        peekCodeElem.textContent = topItem ? `"${topItem.name}"` : 'null';
    }

    const sizeCodeElem = document.getElementById('ds-size-value');
    if (sizeCodeElem) {
        sizeCodeElem.textContent = pageStack.size();
    }

    // 6. Metrics Counters
    const pushCountElem = document.getElementById('stat-push-count');
    if (pushCountElem) pushCountElem.textContent = metrics.pushes;

    const popCountElem = document.getElementById('stat-pop-count');
    if (popCountElem) popCountElem.textContent = metrics.pops;

    const peakCountElem = document.getElementById('stat-peak-count');
    if (peakCountElem) peakCountElem.textContent = metrics.peak;

    const stackSizeElem = document.getElementById('stack-size-count');
    if (stackSizeElem) stackSizeElem.textContent = pageStack.size();
}

function bindEvents() {
    const links = document.querySelectorAll('a[data-page]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            const pageName = this.getAttribute('data-page');
            const targetUrl = this.getAttribute('href');
            navigateToPage(pageName, targetUrl);
        });
    });

    const backBtns = document.querySelectorAll('.btn-back');
    backBtns.forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            navigateBack();
        };
    });

    const resetBtns = document.querySelectorAll('.btn-reset-stack');
    resetBtns.forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            resetStack();
        };
    });

    const triggers = document.querySelectorAll('.btn-stack-trigger, #floating-stack-fab');
    const modal = document.getElementById('stack-modal-overlay');
    triggers.forEach(trig => {
        trig.onclick = function(e) {
            e.preventDefault();
            if (modal) modal.classList.add('active');
        };
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

if (typeof window !== 'undefined') window.PageStack = PageStack;
if (typeof global !== 'undefined') global.PageStack = PageStack;

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageStack);
    } else {
        initPageStack();
    }
}

