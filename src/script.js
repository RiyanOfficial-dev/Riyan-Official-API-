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
        showToast('Failed to initialize app', 'error');
    } finally {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
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
        console.error(error);
        showToast('Failed to load settings', 'error');
        return {}; // fallback kosong, jangan pakai default duplikat
    }
}

function setupUI() {
    if (!settings) return;
    document.getElementById("contactLink").href = settings.links || '#';
    document.getElementById("titleApi").textContent = settings.name || '';
    document.getElementById("descApi").textContent = settings.description || '';
    document.getElementById("footer").textContent = `© 2025 ${settings.creator || ''} - ${settings.name || ''}`;
}

function updateActiveUsers() {
    const el = document.getElementById('activeUsers');
    const users = Math.floor(Math.random() * 5000) + 1000;
    el.textContent = users.toLocaleString();
}

async function loadAPIData() {
    const apiList = document.getElementById('apiList');
    if (!settings.categories || settings.categories.length === 0) return;

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
                                            <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-600 text-gray-300">${item.status || 'ready'}</span>
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
                                        <div class="mb-4 space-y-3" id="params-container-${catIndex}-${endpointIndex}"></div>
                                        
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
                                                <i class="fas fa-play"></i>
                                                Execute
                                            </button>
                                            <button type="button" onclick="clearResponse(${catIndex}, ${endpointIndex})" class="bg-gray-700 border border-gray-600 hover:border-gray-500 font-semibold text-slate-300 px-6 py-2 text-xs font-medium transition-colors duration-150 flex items-center gap-1">
                                                <i class="fas fa-times"></i>
                                                Clear
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

    // Initialize parameters for each endpoint
    settings.categories.forEach((category, catIndex) => {
        category.items.forEach((item, endpointIndex) => {
            initializeEndpointParameters(catIndex, endpointIndex, item);
        });
    });

    document.getElementById('totalApis').textContent = totalApis;
    document.getElementById('totalCategories').textContent = settings.categories.length;

    initializeSearch();
}

// ------------------- PARAMS & URL -------------------
function initializeEndpointParameters(catIndex, endpointIndex, item) {
    const paramsContainer = document.getElementById(`params-container-${catIndex}-${endpointIndex}`);
    const params = extractParameters(item.path);

    if (params.length === 0) {
        paramsContainer.innerHTML = `
            <div class="text-center py-3">
                <i class="fas fa-check text-green-500 text-xs mb-1"></i>
                <p class="text-xxs text-gray-400">No parameters required</p>
            </div>
        `;
        return;
    }

    let paramsHtml = '';
    params.forEach(param => {
        const isRequired = param.required;
        paramsHtml += `<div>
            <div class="flex items-center justify-between mb-1">
                <label class="block text-[13px] font-medium text-slate-400">${param.name} ${isRequired ? '<span class="text-red-500">*</span>' : ''}</label>
                <span class="text-[13px] text-gray-500">${param.type}</span>
            </div>
            <input 
                type="text" 
                name="${param.name}" 
                class="w-full px-3 py-2 border border-gray-600 text-sm focus:outline-none focus:border-indigo-500 bg-gray-700 placeholder:text-slate-500"
                placeholder=""
                ${isRequired ? 'required' : ''}
                oninput="updateRequestUrl(${catIndex}, ${endpointIndex})"
                id="param-${catIndex}-${endpointIndex}-${param.name}">
        </div>`;
    });

    paramsContainer.innerHTML = paramsHtml;
    updateRequestUrl(catIndex, endpointIndex);
}

function extractParameters(path) {
    const params = [];
    const queryString = path.split('?')[1];
    if (!queryString) return params;

    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams) {
        if (value === '' || value === 'YOUR_API_KEY') {
            params.push({
                name: key,
                required: true,
                type: 'string'
            });
        }
    }
    return params;
}

function updateRequestUrl(catIndex, endpointIndex) {
    const form = document.getElementById(`form-${catIndex}-${endpointIndex}`);
    if (!form) return { url: '', hasErrors: false };

    const baseUrl = settings.categories[catIndex].items[endpointIndex].path.split('?')[0];
    const queryParams = new URLSearchParams();
    let hasErrors = false;

    form.querySelectorAll('input[type="text"]').forEach(input => {
        const paramValue = input.value.trim();
        if (input.required && !paramValue) hasErrors = true;
        if (paramValue) queryParams.set(input.name, paramValue);
    });

    const url = baseUrl + (queryParams.toString() ? '?' + queryParams.toString() : '');
    const urlDisplay = document.getElementById(`url-display-${catIndex}-${endpointIndex}`);
    if (urlDisplay) urlDisplay.textContent = url;

    return { url, hasErrors };
}

// ------------------- TOGGLE -------------------
function toggleCategory(index) {
    const category = document.getElementById(`category-${index}`);
    const icon = document.getElementById(`category-icon-${index}`);
    category.classList.toggle('hidden');
    icon.textContent = category.classList.contains('hidden') ? 'expand_more' : 'expand_less';
}

function toggleEndpoint(catIndex, endpointIndex) {
    const endpoint = document.getElementById(`endpoint-${catIndex}-${endpointIndex}`);
    const icon = document.getElementById(`endpoint-icon-${catIndex}-${endpointIndex}`);
    endpoint.classList.toggle('hidden');
    icon.textContent = endpoint.classList.contains('hidden') ? 'expand_more' : 'expand_less';
}

// ------------------- SEARCH -------------------
function initializeSearch() {
    allApiItems = [];
    document.querySelectorAll('.api-item').forEach(item => {
        allApiItems.push({
            element: item,
            name: item.getAttribute('data-alias')?.toLowerCase() || '',
            desc: item.getAttribute('data-description')?.toLowerCase() || '',
            path: item.getAttribute('data-path')?.toLowerCase() || '',
            category: item.getAttribute('data-category')?.toLowerCase() || ''
        });
    });

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const noResults = document.getElementById('noResults');
        if (!searchTerm) {
            document.querySelectorAll('.category-group').forEach(c => c.style.display = '');
            document.querySelectorAll('.api-item').forEach(i => i.style.display = '');
            noResults.classList.add('hidden');
            return;
        }

        let visibleCount = 0;
        allApiItems.forEach(item => {
            const matches = item.name.includes(searchTerm) || item.desc.includes(searchTerm) || item.path.includes(searchTerm) || item.category.includes(searchTerm);
            if (matches) {
                item.element.style.display = '';
                const catGroup = item.element.closest('.category-group');
                if (catGroup) catGroup.style.display = '';
                visibleCount++;
            } else item.element.style.display = 'none';
        });

        document.querySelectorAll('.category-group').forEach(category => {
            const hasVisible = category.querySelector('.api-item:not([style*="none"])');
            if (!hasVisible) category.style.display = 'none';
        });

        noResults.classList.toggle('hidden', visibleCount > 0);
    });
}

// ------------------- EXECUTE / CLEAR -------------------
async function executeRequest(event, catIndex, endpointIndex, method, path, produces) {
    event.preventDefault();
    const { url, hasErrors } = updateRequestUrl(catIndex, endpointIndex);
    if (hasErrors) return showToast('Please fill in all required parameters', 'error');

    const responseDiv = document.getElementById(`response-${catIndex}-${endpointIndex}`);
    const responseContent = document.getElementById(`response-content-${catIndex}-${endpointIndex}`);
    const responseStatus = document.getElementById(`response-status-${catIndex}-${endpointIndex}`);
    const responseTime = document.getElementById(`response-time-${catIndex}-${endpointIndex}`);

    responseDiv.classList.remove('hidden');
    responseContent.innerHTML = '<div class="loader mt-4"></div>';
    responseStatus.textContent = 'Loading...';
    responseStatus.className = 'text-xs px-2 py-1 rounded bg-gray-600 text-gray-300';
    responseTime.textContent = '';

    const startTime = Date.now();

    try {
        const response = await fetch(url, { method: method, headers: { 'Accept': '*/*', 'User-Agent': 'RiyanOfficial-API-Docs' } });
        const responseTimeMs = Date.now() - startTime;
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        const contentType = response.headers.get('content-type') || '';
        responseStatus.textContent = `${response.status} OK`;
        responseStatus.className = 'text-xs px-2 py-1 rounded bg-green-500/20 text-green-400';
        responseTime.textContent = `${responseTimeMs}ms`;

        if (contentType.startsWith('image/')) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            responseContent.innerHTML = `<img src="${blobUrl}" class="max-w-full max-h-full object-contain rounded">`;
        } else if (contentType.includes('audio/')) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            responseContent.innerHTML = `<audio controls autoplay class="w-full max-w-md"><source src="${blobUrl}" type="${contentType}"></audio>`;
        } else if (contentType.includes('video/')) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            responseContent.innerHTML = `<video controls autoplay class="w-full h-full object-contain rounded"><source src="${blobUrl}" type="${contentType}"></video>`;
        } else if (contentType.includes('application/json')) {
            const data = await response.json();
            const formattedResponse = JSON.stringify(data, null, 2);
            responseContent.innerHTML = `<pre class="block whitespace-pre-wrap text-xs px-4 pt-3 pb-2 overflow-x-auto leading-relaxed">${formattedResponse}</pre>`;
        } else {
            const text = await response.text();
            responseContent.innerHTML = `<pre class="text-xs p-4 overflow-x-auto whitespace-nowrap">${escapeHtml(text)}</pre>`;
        }

        showToast('Request successful!', 'success');

    } catch (error) {
        const errorMessage = error.message || 'Unknown error occurred';
        responseContent.innerHTML = `<div class="text-center py-8"><i class="fas fa-exclamation-triangle text-2xl text-red-
