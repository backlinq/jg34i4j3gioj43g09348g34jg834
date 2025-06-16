// ==UserScript==
// @name         Vertical Copy Bar for Custom Code Block (Dual-Side Bars)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Adds vertical copy bars to both sides of code blocks. Change TARGET_SELECTOR below to match your code block element/class.
// @author       You
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // === TARGETED ELEMENT SELECTOR ===
    const TARGET_SELECTOR = 'div.-mt-xl:not(.code-block-with-bar)';

    // === STYLES ===
    GM_addStyle(`
    .vertical-copy-bar {
        position: absolute;
        top: 0;
        height: 100%;
        width: 38px;
        background: #fff;
        border-radius: 8px 0 0 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        cursor: pointer;
        z-index: 10;
        transition: background 0.2s, color 0.2s;
        border: 1px solid #2e323c;
    }
    .vertical-copy-bar.right {
        left: auto;
        right: 0;
        border-radius: 0 8px 8px 0;
        border-left: 1px solid #2e323c;
        border-right: none;
    }
    .vertical-copy-bar.left {
        left: 0;
        right: auto;
        border-right: 1px solid #2e323c;
        border-left: none;
    }
    .vertical-copy-bar:hover {
        background: #fff;
    }
    .vertical-copy-bar:hover svg,
    .vertical-copy-bar:hover span {
        color: #22c55e !important;
    }
    .vertical-copy-bar svg {
        width: 22px;
        height: 22px;
        color: #7e8a99;
        margin-bottom: 4px;
        transition: color 0.2s;
    }
    .vertical-copy-bar span {
        font-size: 12px;
        color: #7e8a99;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        letter-spacing: 2px;
        transition: color 0.2s;
    }
    .code-block-with-bar {
        position: relative !important;
        padding-left: 48px !important;
        padding-right: 48px !important;
    }
    .vertical-copy-bar.copied {
        background: #22c55e !important;
        border-color: #22c55e !important;
    }
    .vertical-copy-bar.copied svg,
    .vertical-copy-bar.copied span {
        color: #fff !important;
    }
    `);

    // === CORE FUNCTION ===
    function addCopyBarToBlock(block) {
        if (block.classList.contains('code-block-with-bar')) return;
        block.classList.add('code-block-with-bar');
        block.style.position = 'relative';

        function createBar(side) {
            const bar = document.createElement('div');
            bar.className = `vertical-copy-bar ${side}`;
            bar.title = 'Copy code';
            bar.innerHTML = `
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" fill="none"></rect>
                    <path d="M5 15V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10" />
                </svg>
                <span>Copy</span>
            `;
            bar.onclick = function(e) {
                e.stopPropagation();
                const code = block.querySelector('code');
                if (!code) return;
                navigator.clipboard.writeText(code.innerText.trim());
                bar.classList.add('copied');
                bar.querySelector('span').textContent = 'Copied!';
                setTimeout(() => {
                    bar.classList.remove('copied');
                    bar.querySelector('span').textContent = 'Copy';
                }, 1200);
            };
            return bar;
        }

        // Add both bars
        block.insertBefore(createBar('left'), block.firstChild);
        block.appendChild(createBar('right'));
    }

    // === INITIAL SCAN ===
    function scanBlocks() {
        document.querySelectorAll(TARGET_SELECTOR).forEach(addCopyBarToBlock);
    }

    // === OPTIMIZED OBSERVER ===
    let mutationQueued = false;
    function processMutations() {
        mutationQueued = false;
        scanBlocks();
    }

    const observer = new MutationObserver(() => {
        if (!mutationQueued) {
            mutationQueued = true;
            requestAnimationFrame(processMutations);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // === INITIAL RUN ===
    scanBlocks();

})();
