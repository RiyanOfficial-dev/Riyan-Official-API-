// Riyan Official API Documentation Script
// Main application controller for API documentation interface

// ==================== CONFIGURATION ====================
const settings = {};
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

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Main initialization function
 */
async function initializeApp() {
    try {
        settings = await loadSettings();
        setupUI();
        await loadAPIData();
        setupEventListeners();
        updateActiveUsers();
    } catch (error) {
        console.error('Initialization Error:', error);
        showErrorMessage(error);
    } finally {
        hideLoadingScreen();
    }
}

/**
 * Load settings from server or use defaults
 */
async function loadSettings() {
    try {
        const response = await fetch('/settings');
        if (!response.ok) throw new Error('Settings not found');
        return await response.json();
    } catch (error) {
        return getDefaultSettings();
    }
}

/**
 * Get default settings
 */
function getDefaultSettings() {
    return {
        name: "Riyan Official API",
        creator: "Riyan",
        description: "Interactive API documentation with real-time testing",
        categories: getDefaultCategories()
    };
}

/**
 * Get default categories
 */
function getDefaultCategories() {
    return [];
}

// ==================== UI SETUP ====================
/**
 * Setup UI elements with settings
 */
function setupUI() {
    if (settings.links) {
        document.getElementById("contactLink").href = settings.links;
    }
    
    document.getElementById("titleApi").textContent = settings.name || "Riyan Official API";
    document.getElementById("descApi").textContent = settings.description || "Interactive API documentation";
    document.getElementById("footer").textContent = `© 2025 ${settings.creator || "Riyan"} - ${settings.name || "API"}`;
}

/**
 * Hide loading screen with fade effect
 */
function hideLoadingScreen() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 900);
}

/**
 * Update active users count (demo)
 */
function updateActiveUsers() {
    const el = document.getElementById('activeUsers');
    if (el) {
        const users = Math.floor(Math.random() * 5000) + 1000;
        el.textContent = users.toLocaleString();
    }
}

// ==================== API DATA LOADING ====================
/**
 * Load and render API data
 */
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
        
        html += generateCategoryHTML(category, catIndex, icon);
    });
    
    apiList.innerHTML = html;
    initializeAllEndpointParameters();
    
    document.getElementById('totalApis').textContent = totalApis;
    document.getElementById('totalCategories').textContent = settings.categories.length;
    
    initializeSearch();
}

/**
 * Generate HTML for a category
 */
function generateCategoryHTML(category, catIndex, icon) {
    return `
        <div class="category-group" data-category="${category.name.toLowerCase()}">
            <div class="mb-2">
                <div class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                    <button onclick="toggleCategory(${catIndex})" 
                            class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700 transition-colors duration-150">
                        <h2 class="font-bold flex items-center">
                            <span class="material-icons text-lg mr-3 text-gray-400">${icon}</span>
                            <span class="truncate max-w-xs text-sm">${category.name}</span>
                            <span class="ml-2 text-xs text-gray-500">(${category.items.length})</span>
                        </h2>
                        <span class="material-icons transition-transform duration-150" id="category-icon-${catIndex}">expand_more</span>
                    </button>
                    
                    <div id="category-${catIndex}" class="hidden">
                        ${category.items.map((item, endpointIndex) => generateEndpointHTML(item, catIndex, endpointIndex)).join('')}
                    </div>
                </div>
            </div>
        </div>`;
}

/**
 * Generate HTML for an endpoint
 */
function generateEndpointHTML(item, catIndex, endpointIndex) {
    const method = item.method || 'GET';
    const path = item.path.split('?')[0];
    const statusClass = getStatusClass(item.status || 'ready');
    
    return `
        <div class="border-t border-gray-700 api-item" 
             data-method="${method.toLowerCase()}"
             data-path="${path}"
             data-alias="${item.name}"
             data-description="${item.desc}"
             data-category="${item.category || ''}">
            <button onclick="toggleEndpoint(${catIndex}, ${endpointIndex})" 
                    class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700 transition-colors duration-150">
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
            
            ${generateEndpointDetails(item, catIndex, endpointIndex, method, path)}
        </div>`;
}

/**
 * Generate HTML for endpoint details
 */
function generateEndpointDetails(item, catIndex, endpointIndex, method, path) {
    return `
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
                            <button type="button" onclick="copyUrl(${catIndex}, ${endpointIndex})" 
                                    class="copy-btn bg-gray-700 border border-gray-600 hover:border-gray-500 text-slate-300 px-3 py-2 rounded text-xs font-medium transition-colors duration-150">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                        <button type="button" onclick="executeRequest(event, ${catIndex}, ${endpointIndex}, '${method}', '${path}', 'application/json')" 
                                class="btn-gradient font-semibold text-white px-6 py-2 text-xs font-medium transition-colors duration-150 flex items-center gap-1">
                            <i class="fas fa-play"></i>
                            Execute
                        </button>
                        <button type="button" onclick="clearResponse(${catIndex}, ${endpointIndex})" 
                                class="bg-gray-700 border border-gray-600 hover:border-gray-500 font-semibold text-slate-300 px-6 py-2 text-xs font-medium transition-colors duration-150 flex items-center gap-1">
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
        </div>`;
}

/**
 * Get CSS class for status badge
 */
function getStatusClass(status) {
    const statusClasses = {
        'ready': 'status-ready',
        'update': 'status-update',
        'error': 'status-error'
    };
    return statusClasses[status] || 'bg-gray-600 text-gray-300';
}

// ==================== PARAMETER HANDLING ====================
/**
 * Initialize parameters for all endpoints
 */
function initializeAllEndpointParameters() {
    settings.categories.forEach((category, catIndex) => {
        category.items.forEach((item, endpointIndex) => {
            initializeEndpointParameters(catIndex, endpointIndex, item);
        });
    });
}

/**
 * Initialize parameters for a specific endpoint
 */
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
    
    paramsContainer.innerHTML = params.map(param => generateParameterHTML(param, catIndex, endpointIndex)).join('');
    updateRequestUrl(catIndex, endpointIndex);
}

/**
 * Extract parameters from path
 */
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
                type: getParamType(key),
                description: getParamDescription(key)
            });
        }
    }
    
    return params;
}

/**
 * Generate HTML for a parameter
 */
function generateParameterHTML(param, catIndex, endpointIndex) {
    return `
        <div>
            <div class="flex items-center justify-between mb-1">
                <label class="block text-[13px] font-medium text-slate-400">
                    ${param.name} ${param.required ? '<span class="text-red-500">*</span>' : ''}
                </label>
                <span class="text-[13px] text-gray-500">${param.type}</span>
            </div>
            <input type="text" 
                   name="${param.name}" 
                   class="w-full px-3 py-2 border border-gray-600 text-sm focus:outline-none focus:border-indigo-500 bg-gray-700 placeholder:text-slate-500"
                   placeholder="${param.description}"
                   ${param.required ? 'required' : ''}
                   oninput="updateRequestUrl(${catIndex}, ${endpointIndex})"
                   id="param-${catIndex}-${endpointIndex}-${param.name}">
        </div>`;
}

/**
 * Get parameter type based on name
 */
function getParamType(paramName) {
    const typeMap = {
        'apikey': 'string',
        'url': 'string',
        'question': 'string',
        'query': 'string',
        'prompt': 'string',
        'format': 'string',
        'quality': 'string',
        'size': 'string',
        'limit': 'number'
    };
    return typeMap[paramName] || 'string';
}

/**
 * Get parameter description
 */
function getParamDescription(paramName) {
    const descriptionMap = {
        'apikey': 'Your API key for authentication',
        'url': 'URL of the content to download/process',
        'question': 'Question or message to ask the AI',
        'query': 'Search query or keywords',
        'prompt': 'Text description for image generation',
        'format': 'Output format (mp4, mp3, jpg, png)',
        'quality': 'Video quality (360p, 720p, 1080p)',
        'size': 'Image dimensions (512x512, 1024x1024)',
        'limit': 'Number of results to return'
    };
    return descriptionMap[paramName] || paramName;
}

// ==================== SEARCH FUNCTIONALITY ====================
/**
 * Initialize search functionality
 */
function initializeSearch() {
    allApiItems = [];
    
    document.querySelectorAll('.api-item').forEach(item => {
        allApiItems.push({
            element: item,
            name: (item.getAttribute('data-alias') || '').toLowerCase(),
            desc: (item.getAttribute('data-description') || '').toLowerCase(),
            path: (item.getAttribute('data-path') || '').toLowerCase(),
            category: (item.getAttribute('data-category') || '').toLowerCase()
        });
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    document.addEventListener('keydown', handleEnterKey);
}

/**
 * Handle search input
 */
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const noResults = document.getElementById('noResults');
    
    if (!searchTerm) {
        resetSearch();
        noResults.classList.add('hidden');
        return;
    }
    
    let visibleCount = 0;
    
    allApiItems.forEach(item => {
        const matches = 
            item.name.includes(searchTerm) || 
            item.desc.includes(searchTerm) || 
            item.path.includes(searchTerm) ||
            item.category.includes(searchTerm);
        
        if (matches) {
            item.element.style.display = '';
            showParentCategory(item.element);
            visibleCount++;
        } else {
            item.element.style.display = 'none';
        }
    });
    
    hideEmptyCategories();
    noResults.classList.toggle('hidden', visibleCount > 0);
}

/**
 * Reset search results
 */
function resetSearch() {
    document.querySelectorAll('.category-group').forEach(group => {
        group.style.display = '';
    });
    
    document.querySelectorAll('.api-item').forEach(item => {
        item.style.display = '';
    });
}

/**
 * Show parent category of an element
 */
function showParentCategory(element) {
    const categoryGroup = element.closest('.category-group');
    if (categoryGroup) {
        categoryGroup.style.display = '';
    }
}

/**
 * Hide categories with no visible items
 */
function hideEmptyCategories() {
    document.querySelectorAll('.category-group').forEach(category => {
        const hasVisible = category.querySelector('.api-item[style=""]') || 
                         category.querySelector('.api-item:not([style*="none"])');
        category.style.display = hasVisible ? '' : 'none';
    });
}

// ==================== UI INTERACTIONS ====================
/**
 * Handle Enter key for form submission
 */
function handleEnterKey(event) {
    if (event.key === 'Enter' && event.target.matches('input[type="text"]')) {
        const form = event.target.closest('form');
        if (!form) return;
        
        const formId = form.id;
        const parts = formId.split('-');
        
        if (parts.length >= 3) {
            const catIndex = parseInt(parts[1]);
            const endpointIndex = parseInt(parts[2]);
            
            if (!isNaN(catIndex) && !isNaN(endpointIndex) && 
                settings.categories?.[catIndex]?.items?.[endpointIndex]) {
                
                const item = settings.categories[catIndex].items[endpointIndex];
                executeRequest(event, catIndex, endpointIndex, item.method || 'GET', item.path, 'application/json');
            }
        }
    }
}

/**
 * Toggle category visibility
 */
function toggleCategory(index) {
    const category = document.getElementById(`category-${index}`);
    const icon = document.getElementById(`category-icon-${index}`);
    
    if (!category || !icon) return;
    
    if (category.classList.contains('hidden')) {
        category.classList.remove('hidden');
        icon.textContent = 'expand_less';
    } else {
        category.classList.add('hidden');
        icon.textContent = 'expand_more';
    }
}

/**
 * Toggle endpoint visibility
 */
function toggleEndpoint(catIndex, endpointIndex) {
    const endpoint = document.getElementById(`endpoint-${catIndex}-${endpointIndex}`);
    const icon = document.getElementById(`endpoint-icon-${catIndex}-${endpointIndex}`);
    
    if (!endpoint || !icon) return;
    
    if (endpoint.classList.contains('hidden')) {
        endpoint.classList.remove('hidden');
        icon.textContent = 'expand_less';
    } else {
        endpoint.classList.add('hidden');
        icon.textContent = 'expand_more';
    }
}

// ==================== REQUEST HANDLING ====================
/**
 * Update request URL based on parameters
 */
function updateRequestUrl(catIndex, endpointIndex) {
    const form = document.getElementById(`form-${catIndex}-${endpointIndex}`);
    if (!form) return { url: '', hasErrors: false };
    
    const baseUrl = settings.categories[catIndex].items[endpointIndex].path.split('?')[0];
    const queryParams = new URLSearchParams();
    let hasErrors = false;
    
    form.querySelectorAll('input[type="text"]').forEach(input => {
        const paramName = input.name;
        const paramValue = input.value.trim();
        
        input.classList.remove('border-red-500');
        
        if (input.required && !paramValue) {
            hasErrors = true;
            input.classList.add('border-red-500');
        }
        
        if (paramValue) {
            queryParams.set(paramName, paramValue);
        }
    });
    
    const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl;
    const urlDisplay = document.getElementById(`url-display-${catIndex}-${endpointIndex}`);
    
    if (urlDisplay) {
        urlDisplay.textContent = url;
    }
    
    return { url, hasErrors };
}

/**
 * Execute API request
 */
async function executeRequest(event, catIndex, endpointIndex, method, path, produces) {
    event.preventDefault();
    
    const { url, hasErrors } = updateRequestUrl(catIndex, endpointIndex);
    
    if (hasErrors) {
        showToast('Please fill in all required parameters', 'error');
        return;
    }
    
    const responseDiv = document.getElementById(`response-${catIndex}-${endpointIndex}`);
    const responseContent = document.getElementById(`response-content-${catIndex}-${endpointIndex}`);
    const responseStatus = document.getElementById(`response-status-${catIndex}-${endpointIndex}`);
    const responseTime = document.getElementById(`response-time-${catIndex}-${endpointIndex}`);
    
    // Show loading state
    responseDiv.classList.remove('hidden');
    responseContent.innerHTML = '<div class="loader mt-4"></div>';
    responseStatus.textContent = 'Loading...';
    responseStatus.className = 'text-xs px-2 py-1 rounded bg-gray-600 text-gray-300';
    responseTime.textContent = '';
    
    const startTime = Date.now();
    
    try {
        console.log('Executing request:', url);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Accept': '*/*',
                'User-Agent': 'RiyanOfficial-API-Docs'
            }
        });
        
        const responseTimeMs = Date.now() - startTime;
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        await handleResponse(response, catIndex, endpointIndex, responseTimeMs);
        showToast('Request successful!', 'success');
        
    } catch (error) {
        console.error('API Request Error:', error);
        handleRequestError(error, catIndex, endpointIndex);
        showToast(`Request failed: ${error.message}`, 'error');
    }
}

/**
 * Handle API response
 */
async function handleResponse(response, catIndex, endpointIndex, responseTimeMs) {
    const responseContent = document.getElementById(`response-content-${catIndex}-${endpointIndex}`);
    const responseStatus = document.getElementById(`response-status-${catIndex}-${endpointIndex}`);
    const responseTime = document.getElementById(`response-time-${catIndex}-${endpointIndex}`);
    const contentType = response.headers.get('content-type') || '';
    
    responseStatus.textContent = `${response.status} OK`;
    responseStatus.className = 'text-xs px-2 py-1 rounded bg-green-500/20 text-green-400';
    responseTime.textContent = `${responseTimeMs}ms`;
    
    // Handle different content types
    if (contentType.startsWith('image/')) {
        await handleImageResponse(response, responseContent);
    } else if (contentType.includes('audio/')) {
        await handleAudioResponse(response, responseContent, contentType);
    } else if (contentType.includes('video/')) {
        await handleVideoResponse(response, responseContent, contentType);
    } else if (contentType.includes('application/json')) {
        await handleJsonResponse(response, responseContent);
    } else {
        await handleTextResponse(response, responseContent);
    }
}

/**
 * Handle image response
 */
async function handleImageResponse(response, responseContent) {
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    responseContent.innerHTML = `
        <img src="${blobUrl}" 
             alt="Image Response" 
             class="max-w-full max-h-full object-contain rounded">
    `;
}

/**
 * Handle audio response
 */
async function handleAudioResponse(response, responseContent, contentType) {
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    responseContent.innerHTML = `
        <audio controls autoplay class="w-full max-w-md">
            <source src="${blobUrl}" type="${contentType}">
        </audio>
    `;
}

/**
 * Handle video response
 */
async function handleVideoResponse(response, responseContent, contentType) {
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    responseContent.innerHTML = `
        <video controls autoplay class="w-full h-full object-contain rounded">
            <source src="${blobUrl}" type="${contentType}">
        </video>
    `;
}

/**
 * Handle JSON response
 */
async function handleJsonResponse(response, responseContent) {
    const data = await response.json();
    
    if (data && typeof data === 'object' && data.error) {
        throw new Error(`API Error: ${data.error}`);
    }
    
    const formattedResponse = JSON.stringify(data, null, 2);
    responseContent.innerHTML = `
        <pre class="block whitespace-pre-wrap text-xs px-4 pt-3 pb-2 overflow-x-auto leading-relaxed">
${formattedResponse}
        </pre>
    `;
}

/**
 * Handle text response
 */
async function handleTextResponse(response, responseContent) {
    const text = await response.text();
    responseContent.innerHTML = `
        <pre class="text-xs p-4 overflow-x-auto whitespace-nowrap">${escapeHtml(text)}</pre>
    `;
}

/**
 * Handle request error
 */
function handleRequestError(error, catIndex, endpointIndex) {
    const responseContent = document.getElementById(`response-content-${catIndex}-${endpointIndex}`);
    const responseStatus = document.getElementById(`response-status-${catIndex}-${endpointIndex}`);
    const responseTime = document.getElementById(`response-time-${catIndex}-${endpointIndex}`);
    
    responseContent.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-exclamation-triangle text-2xl text-red-400 mb-3"></i>
            <div class="text-sm font-medium text-red-400">Error</div>
            <div class="text-xs text-gray-400 mt-1">${escapeHtml(error.message)}</div>
        </div>
    `;
    
    responseStatus.textContent = 'Error';
    responseStatus.className = 'text-xs px-2 py-1 rounded bg-red-500/20 text-red-400';
    responseTime.textContent = '0ms';
}

// ==================== UTILITY FUNCTIONS ====================
/**
 * Clear response and form
 */
function clearResponse(catIndex, endpointIndex) {
    const form = document.getElementById(`form-${catIndex}-${endpointIndex}`);
    const responseDiv = document.getElementById(`response-${catIndex}-${endpointIndex}`);
    
    if (!form || !responseDiv) return;
    
    form.querySelectorAll('input[type="text"]').forEach(input => {
        input.value = '';
        input.classList.remove('border-red-500');
    });
    
    responseDiv.classList.add('hidden');
    updateRequestUrl(catIndex, endpointIndex);
    
    showToast('Form cleared', 'info');
}

/**
 * Copy URL to clipboard
 */
function copyUrl(catIndex, endpointIndex) {
    const urlDisplay = document.getElementById(`url-display-${catIndex}-${endpointIndex}`);
    if (!urlDisplay) return;
    
    const url = window.location.origin + urlDisplay.textContent;
    
    navigator.clipboard.writeText(url)
        .then(() => showToast('URL copied!', 'success'))
        .catch(err => {
            console.error('Failed to copy URL:', err);
            showToast('Failed to copy URL', 'error');
        });
}

/**
 * Copy response to clipboard
 */
function copyResponse(catIndex, endpointIndex) {
    const responseContent = document.getElementById(`response-content-${catIndex}-${endpointIndex}`);
    if (!responseContent) return;
    
    const text = responseContent.textContent;
    
    navigator.clipboard.writeText(text)
        .then(() => showToast('Response copied!', 'success'))
        .catch(err => {
            console.error('Failed to copy response:', err);
            showToast('Failed to copy response', 'error');
        });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icon = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle'
    }[type] || 'fa-info-circle';
    
    const color = {
        'success': '#10b981',
        'error': '#ef4444',
        'info': '#3b82f6'
    }[type] || '#3b82f6';
    
    toast.innerHTML = `
        <i class="fas ${icon} text-sm" style="color: ${color}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show error message
 */
function showErrorMessage(err = undefined) {
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div class="text-center">
                <i class="fas fa-wifi text-3xl text-slate-400 mb-4"></i>
                <p class="text-sm text-slate-400">${err ? err : "Using demo configuration"}</p>
            </div>
        `;
    }
    
    settings = getDefaultSettings();
    setupUI();
    loadAPIData();
    setupEventListeners();
    updateActiveUsers();
    
    hideLoadingScreen();
}

// ==================== GLOBAL EXPORTS ====================
// Make functions available globally
window.toggleCategory = toggleCategory;
window.toggleEndpoint = toggleEndpoint;
window.executeRequest = executeRequest;
window.clearResponse = clearResponse;
window.copyUrl = copyUrl;
window.copyResponse = copyResponse;
window.updateRequestUrl = updateRequestUrl;
