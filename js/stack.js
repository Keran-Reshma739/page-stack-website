/**
 * PageStack Class - Elite Software Architecture
 * Features: Dynamic 5-Tab Mobile Navigation, Floating LIFO Controller Bar,
 * Real-time Virtual Memory Hex Pointers, and HTML5 LocalStorage persistence.
 */
class PageStack {
    constructor() {
        this.storageKey = 'stack_page_history_v4';
        this.metricsKey = 'stack_page_metrics_v4';
        
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

    pop() {
        if (this.isEmpty()) return null;
        
        const popped = this.items.pop();
        this.metrics.pops++;
        
        this.logEvent('POP', popped ? popped.name : 'Unknown');
        this.saveStack();
        this.saveMetrics();
        
        return popped;
    }

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
 * All Page Metadata
 */
const PAGE_META = {
    'index.html': { name: 'Home', icon: '🏠', subtitle: 'Interactive Stack Simulator' },
    'about.html': { name: 'About', icon: 'ℹ️', subtitle: 'Algorithm Complexity & Storage' },
    'services.html': { name: 'Services', icon: '⚙️', subtitle: 'DSA Suite & Engine Tools' },
    'products.html': { name: 'Products', icon: '📦', subtitle: 'Data Structure Component Library' },
    'gallery.html': { name: 'Gallery', icon: '🖼️', subtitle: 'Visual Flowcharts & Memory Diagrams' },
    'blog.html': { name: 'Blog', icon: '📰', subtitle: 'Computer Science Engineering Blog' },
    'contact.html': { name: 'Contact', icon: '📞', subtitle: 'Developer Hub & QA Forum' },
    'profile.html': { name: 'Profile', icon: '👤', subtitle: 'Session Analytics & Trajectory' }
};

/**
 * 5 Primary Clean Mobile Bottom Tabs (Avoids text line-wrapping on smartphones)
 */
const MOBILE_PRIMARY_TABS = [
    { file: 'index.html', name: 'Home', icon: '🏠' },
    { file: 'about.html', name: 'About', icon: 'ℹ️' },
    { file: 'services.html', name: 'Services', icon: '⚙️' },
    { file: 'products.html', name: 'Products', icon: '📦' },
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
    const meta = PAGE_META[currentFilename] || { name: 'Home', icon: '🏠' };
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
    if (document.querySelector('.mobile-app-bottom-bar')) return;

    const currentFilename = getCurrentPageFilename();

    // 1. Mobile Bottom Tab Bar (5 Clean Tabs)
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

    // 2. Mobile Floating Stack Bar
    const floatingBarHtml = `
        <div class="mobile-floating-stack-bar">
            <div class="m-stack-info">
                <span class="m-stack-icon">🥞</span>
                <span class="m-stack-text">TOP: <strong id="m-top-name">Home</strong></span>
                <span class="m-stack-badge" id="m-stack-size">1</span>
            </div>
            <button class="btn btn-back m-pop-btn">← POP</button>
        </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = bottomBarHtml + floatingBarHtml;
    document.body.appendChild(wrapper);
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
    const meta = PAGE_META[currentFilename] || { name: 'Home', icon: '🏠' };
    
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

    // 2. Active links
    const navLinks = document.querySelectorAll('.nav-link, .mobile-app-tab');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentFilename) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 3. Mobile Floating Controller Updates
    const mTopName = document.getElementById('m-top-name');
    if (mTopName) mTopName.textContent = topItem ? topItem.name : 'None';

    const mStackSize = document.getElementById('m-stack-size');
    if (mStackSize) mStackSize.textContent = pageStack.size();

    // 4. Render Visual Stack
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
                            ${isTop ? '<span class="badge badge-top">👉 TOP</span>' : ''}
                            ${isBottom && !isTop ? '<span class="badge badge-bottom">BASE</span>' : ''}
                        </div>
                    </div>
                `;
            }
            html += '</div>';
            container.innerHTML = html;
        }
    }

    // 5. Update Inspector
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

document.addEventListener('DOMContentLoaded', initPageStack);
