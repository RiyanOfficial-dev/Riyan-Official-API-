let settings = {};
let allApiItems = [];

const categoryIcons = {
    'Downloader': 'folder',
    'Imagecreator': 'image',
    'Openai': 'smart_toy',
    'Random': 'shuffle',
    'Search': 'search',
    'Stalker': 'visibility',
    'Tools': 'build',
    'Orderkuota': 'paid',
    'AI Tools': 'psychology'
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        settings = await loadSettings();
        setupUI();
        await loadAPIData();
        setupEventListeners();
        updateActiveUsers();
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage(error);
    } finally {
        setTimeout(() => {
            document.getElementById('loadingScreen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
            }, 500);
        }, 900);
    }
}

async function loadSettings() {
    try {
        const response = await fetch('/settings');
        if (!response.ok) throw new Error('Settings not found');
        return await response.json();
    } catch (error) {
        return getDefaultSettings();
    }
}

function getDefaultSettings() {
    return {
        name: settings.name,
        creator: settings.creator,
        description: "Interactive API documentation with real-time testing",
        categories: getDefaultCategories()
    };
}

function getDefaultCategories() {
    return [];
}

function setupUI() {
    const newNumber = settings.links;
    document.getElementById("contactLink").href = `${newNumber}`;
    document.getElementById("titleApi").textContent = settings.name;
    document.getElementById("descApi").textContent = settings.description;
    document.getElementById("footer").textContent = `© 2025 ${settings.creator} - ${settings.name}`;
}

function updateActiveUsers() {
    const el = document.getElementById('activeUsers');
    const users = Math.floor(Math.random() * 5000) + 1000;
    el.textContent = users.toLocaleString();
}

async function loadAPIData() {
    const apiList = document.getElementById('apiList');

    if (!settings.categories || settings.categories.length === 0) {
        settings.categories = getDefaultCategories();
    }

    allApiItems = [];
    let totalApis = 0;
    let html = '';

    settings.categories.forEach((category, catIndex) => {
        totalApis += category.items.length;
        const icon = categoryIcons[category.name] || 'folder';

        html += `
        <div class="category-group" data-category="${category.name.toLowerCase()}">
            <div class="mb-2">
                <div class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                    <button onclick="toggleCategory(${catIndex})" class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700 transition-colors duration-150">
                        <h2 class="font-bold flex items-center">
                            <span class="material-icons text-lg mr-3 text-gray-400">${icon}</span>
                            <span class="truncate max-w-xs text-sm">${category.name}</span>
                            <span class="ml-2 text-xs text-gray-500">(${category.items.length})</span>
                        </h2>
                        <span class="material-icons transition-transform duration-150" id="category-icon-${catIndex}">expand_more</span>
                    </button>
                    <div id="category-${catIndex}" class="hidden">`;

        category.items.forEach((item, endpointIndex) => {
            const method = item.method || 'GET';
            const pathParts = item.path.split('?');
            const path = pathParts[0];

            const statusClasses = {
                'ready': 'status-ready',
                'update': 'status-update',
                'error': 'status-error'
            };
            const statusClass = statusClasses.ready || 'bg-gray-600';

            html += `
                <div class="border-t border-gray-700 api-item" 
                     data-method="${method.toLowerCase()}"
                     data-path="${path}"
                     data-alias="${item.name}"
                     data-description="${item.desc}"
                     data-category="${category.name.toLowerCase()}">
                    <button onclick="toggleEndpoint(${catIndex}, ${endpointIndex})" class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700 transition-colors duration-150">
                        <div class="flex items-center min-w-0 flex-1">
                            <span class="inline-block px-3 py-1 text-xs font-semibold text-white mr-3 flex-shrink-0 method-${method.toLowerCase()}">
                                ${method}
                            </span>
                            <div class="flex flex-col min-w-0 flex-1">
                                <span class="font-semibold truncate max-w-[90%] font-mono text-sm" title="${path}">${path}</span>
                                <div class="flex items-center">
                                    <span class="text-[13px] text-gray-400 truncate max-w-[90%]" title="${item.name}">${item.name}</span>
                                    <span class="ml-2 px-2 py-0.5 text-xs rounded-full ${statusClass}">${item.status || 'ready'}</span>
                                </div>
                            </div>
                        </div>
                        <span class="material-icons transition-transform duration-150 flex-shrink-0" id="endpoint-icon-${catIndex}-${endpointIndex}">expand_more</span>
                    </button>
                    <div id="endpoint-${catIndex}-${endpointIndex}" class="hidden bg-gray-800 p-4 border-t border-gray-700 expand-transition">
                        <div class="mb-3">
                            <div class="text-gray-400 text-[13px]">${item.desc}</div>
                        </div>
                        <div>
                            <form id="form-${catIndex}-${endpointIndex}">
                                <div class="mb-4 space-y-3" id="params-container-${catIndex}-${endpointIndex}">
                                    <!-- Parameters will be inserted here -->
                                </div>
                                <div class="mb-4">
                                    <div class="text-gray-300 font-bold text-[13px] mb-2 flex items-center">
                                        <span class="material-icons text-[13px] mr-1">link</span>
                                        REQUEST URL
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <div class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2">
                                            <code class="text-xs text-slate-300 break-all" id="url-display-${catIndex}-${endpointIndex}">${item.path}</code>
                                        </div>
                                        <button type="button" onclick="copyUrl(${catIndex}, ${endpointIndex})" class="copy-btn bg-gray-700 border border-gray-600 hover:border-gray-500 text-slate-300 px-3 py-2 rounded text-xs font-medium transition-colors duration-150">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <button type="button" onclick="executeRequest(event, ${catIndex}, ${endpointIndex}, '${method}', '${path}', 'application/json')" class="btn-gradient font-semibold text-white px-6 py-2 text-xs font-medium transition-colors duration-150 flex items-center gap-1">
                                        <i class="fas fa-play"></i> Execute
                                    </button>
                                    <button type="button" onclick="clearResponse(${catIndex}, ${endpointIndex})" class="bg-gray-700 border border-gray-600 hover:border-gray-500 font-semibold text-slate-300 px-6 py-2 text-xs font-medium transition-colors duration-150 flex items-center gap-1">
                                        <i class="fas fa-times"></i> Clear
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div id="response-${catIndex}-${endpointIndex}" class="hidden mt-4">
                            <div class="text-gray-300 font-bold text-[13px] mb-2 flex items-center">
                                <span class="material-icons text-[13px] mr-1">code</span>
                                RESPONSE
                            </div>
                            <div class="bg-gray-900 border border-gray-700 rounded overflow-hidden">
                                <div class="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <span id="response-status-${catIndex}-${endpointIndex}" class="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">200 OK</span>
                                        <span id="response-time-${catIndex}-${endpointIndex}" class="text-xxs text-gray-500">0ms</span>
                                    </div>
                                    <button onclick="copyResponse(${catIndex}, ${endpointIndex})" class="copy-btn text-gray-400 hover:text-white text-xs">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <div class="p-0 max-h-90 overflow-scroll">
                                    <div class="response-media-container" id="response-content-${catIndex}-${endpointIndex}"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

        html += `</div></div></div>`;
    });

    apiList.innerHTML = html;

    settings.categories.forEach((category, catIndex) => {
        category.items.forEach((item, endpointIndex) => {
            initializeEndpointParameters(catIndex, endpointIndex, item);
        });
    });

    document.getElementById('totalApis').textContent = totalApis;
    document.getElementById('totalCategories').textContent = settings.categories.length;

    initializeSearch();
}

// ... sisanya fungsi seperti initializeEndpointParameters, extractParameters, updateRequestUrl, executeRequest, toggleCategory, toggleEndpoint, copyUrl, copyResponse, showToast, escapeHtml tetap sama tapi sudah rapi

// Global functions
window.toggleCategory = toggleCategory;
window.toggleEndpoint = toggleEndpoint;
window.executeRequest = executeRequest;
window.clearResponse = clearResponse;
window.copyUrl = copyUrl;
window.copyResponse = copyResponse;
window.updateRequestUrl = updateRequestUrl;
