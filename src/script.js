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
        console.log('🚀 Initializing Riyan Official API Dashboard...');
        
        // Load settings first
        settings = await loadSettings();
        console.log('✅ Settings loaded:', settings);
        
        // Setup basic UI
        setupUI();
        
        // Load API data separately
        await loadAPIData();
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('❌ Error:', error);
        showErrorMessage(error);
    } finally {
        // Hide loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 800);
    }
}

async function loadSettings() {
    try {
        console.log('📡 Fetching settings from server...');
        const response = await fetch('/settings');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('⚙️ Settings data received:', data);
        return data;
    } catch (error) {
        console.log('⚠️ Using default settings:', error.message);
        return getDefaultSettings();
    }
}

function getDefaultSettings() {
    return {
        name: "Riyan Official API",
        creator: "Riyan Official",
        description: "Simple and Easy-to-Use API Documentation for seamless WhatsApp Bot integration.",
        links: "https://wa.me/6285715989482",
        categories: []  // Kosong dulu, nanti diisi dari loadAPIData
    };
}

function setupUI() {
    console.log('🎨 Setting up UI...');
    
    // Update contact link
    const contactLink = document.getElementById("contactLink");
    if (contactLink && settings.links) {
        contactLink.href = settings.links;
        console.log('🔗 Contact link set:', settings.links);
    }
    
    // Update title
    const titleApi = document.getElementById("titleApi");
    if (titleApi && settings.name) {
        titleApi.textContent = settings.name;
    }
    
    // Update description
    const descApi = document.getElementById("descApi");
    if (descApi && settings.description) {
        descApi.textContent = settings.description;
    }
    
    // Update footer
    const footer = document.getElementById("footer");
    if (footer) {
        footer.textContent = `© 2025 ${settings.creator || "Riyan Official"} • ${settings.name || "API"} • v1.0.0`;
    }
    
    console.log('✅ UI setup complete');
}

async function loadAPIData() {
    console.log('📊 Loading API endpoints data...');
    
    const apiList = document.getElementById('apiList');
    if (!apiList) {
        console.error('❌ apiList element not found!');
        return;
    }
    
    // Check if categories exist in settings
    if (!settings.categories || settings.categories.length === 0) {
        console.log('📭 No categories in settings, using demo data');
        settings.categories = getDemoCategories();
    }
    
    console.log(`📦 Found ${settings.categories.length} categories`);
    
    allApiItems = [];
    let totalApis = 0;
    let html = '';
    
    // Generate HTML for each category
    settings.categories.forEach((category, catIndex) => {
        if (!category.items || category.items.length === 0) {
            console.log(`⏭️ Skipping empty category: ${category.name}`);
            return;
        }
        
        console.log(`📁 Processing category "${category.name}" with ${category.items.length} items`);
        totalApis += category.items.length;
        const icon = categoryIcons[category.name] || 'folder';
        
        html += `
        <div class="category-group" data-category="${category.name.toLowerCase()}">
            <div class="mb-2">
                <div class="glass rounded-lg overflow-hidden">
                    <button onclick="toggleCategory(${catIndex})" class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700/50 transition-colors duration-150">
                        <h2 class="font-bold flex items-center">
                            <span class="material-icons text-lg mr-3 text-gray-400">${icon}</span>
                            <span class="truncate max-w-xs text-sm">${category.name}</span>
                            <span class="ml-2 text-xs text-gray-500">(${category.items.length})</span>
                        </h2>
                        <span class="material-icons transition-transform duration-150" id="category-icon-${catIndex}">expand_more</span>
                    </button>
                    
                    <div id="category-${catIndex}" class="hidden">`;
        
        // Generate HTML for each endpoint
        category.items.forEach((item, endpointIndex) => {
            const method = item.method || 'GET';
            const path = item.path || '/api/';
            const pathWithoutQuery = path.split('?')[0];
            const name = item.name || 'Unnamed Endpoint';
            const desc = item.desc || 'No description available';
            const status = item.status || 'ready';

            const statusClass = getStatusClass(status);
            const methodClass = method.toLowerCase() === 'post' ? 'method-post' : 'method-get';

            html += `
                        <div class="border-t border-gray-700 api-item" 
                             data-method="${method.toLowerCase()}"
                             data-path="${pathWithoutQuery}"
                             data-alias="${name}"
                             data-description="${desc}"
                             data-category="${category.name.toLowerCase()}">
                            <button onclick="toggleEndpoint(${catIndex}, ${endpointIndex})" class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700/50 transition-colors duration-150">
                                <div class="flex items-center min-w-0 flex-1">
                                    <span class="inline-block px-3 py-1 text-xs font-semibold text-white mr-3 flex-shrink-0 ${methodClass} rounded">
                                        ${method}
                                    </span>
                                    <div class="flex flex-col min-w-0 flex-1">
                                        <span class="font-semibold truncate max-w-[90%] font-mono text-sm" title="${pathWithoutQuery}">${pathWithoutQuery}</span>
                                        <div class="flex items-center">
                                            <span class="text-[13px] text-gray-400 truncate max-w-[90%]" title="${name}">${name}</span>
                                            <span class="ml-2 px-2 py-0.5 text-xs rounded-full ${statusClass}">${status}</span>
                                        </div>
                                    </div>
                                </div>
                                <span class="material-icons transition-transform duration-150 flex-shrink-0" id="endpoint-icon-${catIndex}-${endpointIndex}">expand_more</span>
                            </button>
                            
                            <div id="endpoint-${catIndex}-${endpointIndex}" class="hidden bg-gray-800 p-4 border-t border-gray-700 expand-transition">
                                <div class="mb-3">
                                    <div class="text-gray-400 text-[13px]">${desc}</div>
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
                                                    <code class="text-xs text-slate-300 break-all" id="url-display-${catIndex}-${endpointIndex}">${path}</code>
                                                </div>
                                                <button type="button" onclick="copyUrl(${catIndex}, ${endpointIndex})" class="copy-btn bg-gray-700 border border-gray-600 hover:border-gray-500 text-slate-300 px-3 py-2 rounded text-xs font-medium transition-colors duration-150">
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div class="flex gap-2">
                                            <button type="button" onclick="executeRequest(event, ${catIndex}, ${endpointIndex}, '${method}', '${pathWithoutQuery}', 'application/json')" class="btn-gradient font-semibold text-white px-6 py-2 text-xs font-medium transition-colors duration-150 flex items-center gap-1">
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
    console.log('✅ HTML generated for API endpoints');
    
    // Initialize parameters for each endpoint
    settings.categories.forEach((category, catIndex) => {
        category.items.forEach((item, endpointIndex) => {
            initializeEndpointParameters(catIndex, endpointIndex, item);
        });
    });
    
    // Update stats
    const totalApisEl = document.getElementById('totalApis');
    const totalCategoriesEl = document.getElementById('totalCategories');
    
    if (totalApisEl) {
        totalApisEl.textContent = totalApis;
    }
    
    if (totalCategoriesEl) {
        totalCategoriesEl.textContent = settings.categories.filter(cat => cat.items && cat.items.length > 0).length;
    }
    
    // Initialize search
    initializeSearch();
    
    console.log(`✅ API data loaded: ${totalApis} endpoints across ${settings.categories.length} categories`);
}

function getDemoCategories() {
    return [
        {
            name: "Downloader",
            items: [
                {
                    name: "YouTube Downloader",
                    path: "/api/downloader/youtube?url=&apikey=",
                    method: "GET",
                    desc: "Download videos from YouTube",
                    status: "ready"
                },
                {
                    name: "TikTok Downloader",
                    path: "/api/downloader/tiktok?url=&apikey=",
                    method: "GET",
                    desc: "Download videos from TikTok",
                    status: "ready"
                }
            ]
        },
        {
            name: "Image Creator",
            items: [
                {
                    name: "AI Image Generator",
                    path: "/api/image/ai?prompt=&apikey=",
                    method: "GET",
                    desc: "Generate images using AI",
                    status: "ready"
                },
                {
                    name: "Stable Diffusion",
                    path: "/api/image/stable-diffusion?prompt=&apikey=",
                    method: "GET",
                    desc: "Generate images using Stable Diffusion",
                    status: "ready"
                }
            ]
        }
    ];
}

function getStatusClass(status) {
    const statusClasses = {
        'ready': 'status-ready',
        'update': 'status-update',
        'error': 'status-error'
    };
    return statusClasses[status] || 'bg-gray-600 text-gray-300';
}

// ... [sisanya sama seperti script.js Anda sebelumnya, tanpa perubahan]
// functions: initializeEndpointParameters, extractParameters, getParamType, getParamDescription, 
// initializeSearch, setupEventListeners, handleSearch, handleEnterKey, toggleCategory, 
// toggleEndpoint, updateRequestUrl, executeRequest, clearResponse, copyUrl, copyResponse, 
// showToast, escapeHtml, showErrorMessage

// Pastikan semua function yang ada di script.js asli Anda tetap ada di sini
// Saya hanya menambahkan function getDemoCategories dan getStatusClass

console.log('📄 Riyan Official API Dashboard script loaded successfully!');

// ==================== GLOBAL FUNCTIONS ====================
// Pastikan ini ada di akhir file
window.toggleCategory = function(index) {
    const category = document.getElementById(`category-${index}`);
    const icon = document.getElementById(`category-icon-${index}`);
    if (category && icon) {
        if (category.classList.contains('hidden')) {
            category.classList.remove('hidden');
            icon.textContent = 'expand_less';
        } else {
            category.classList.add('hidden');
            icon.textContent = 'expand_more';
        }
    }
};

window.toggleEndpoint = function(catIndex, endpointIndex) {
    const endpoint = document.getElementById(`endpoint-${catIndex}-${endpointIndex}`);
    const icon = document.getElementById(`endpoint-icon-${catIndex}-${endpointIndex}`);
    if (endpoint && icon) {
        if (endpoint.classList.contains('hidden')) {
            endpoint.classList.remove('hidden');
            icon.textContent = 'expand_less';
        } else {
            endpoint.classList.add('hidden');
            icon.textContent = 'expand_more';
        }
    }
};

window.executeRequest = async function(event, catIndex, endpointIndex, method, path, produces) {
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
    
    responseDiv.classList.remove('hidden');
    responseContent.innerHTML = '<div class="loader mt-4"></div>';
    responseStatus.textContent = 'Loading...';
    responseStatus.className = 'text-xs px-2 py-1 rounded bg-gray-600 text-gray-300';
    responseTime.textContent = '';
    
    const startTime = Date.now();
    
    try {
        console.log('🌐 Making request to:', url);
        
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
        
        const contentType = response.headers.get('content-type') || '';
        
        responseStatus.textContent = `${response.status} OK`;
        responseStatus.className = 'text-xs px-2 py-1 rounded bg-green-500/20 text-green-400';
        responseTime.textContent = `${responseTimeMs}ms`;
        
        if (contentType.startsWith('image/')) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            responseContent.innerHTML = `
                <img src="${blobUrl}" 
                     alt="Image Response" 
                     class="max-w-full max-h-full object-contain rounded">
            `;
            
        } else if (contentType.includes('audio/')) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            responseContent.innerHTML = `
                <audio controls autoplay class="w-full max-w-md">
                    <source src="${blobUrl}" type="${contentType}">
                </audio>
            `;
            
        } else if (contentType.includes('video/')) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            responseContent.innerHTML = `
                <video controls autoplay class="w-full h-full object-contain rounded">
                    <source src="${blobUrl}" type="${contentType}">
                </video>
            `;
            
        } else if (contentType.includes('application/json')) {
            const data = await response.json();
            
            if (data && typeof data === 'object' && data.error) {
                throw new Error(`API Error: ${data.error}`);
            }
            
            const formattedResponse = JSON.stringify(data, null, 2);
            responseContent.innerHTML = `
<pre class="block whitespace-pre-wrap text-xs px-4 pt-3 pb-2 overflow-x-auto leading-relaxed">
${formattedResponse}
</pre>`;
            
        } else if (contentType.includes('text/')) {
            const text = await response.text();
            responseContent.innerHTML = `
                <pre class="text-xs p-4 overflow-x-auto whitespace-nowrap">${escapeHtml(text)}</pre>
            `;
            
        } else {
            const text = await response.text();
            responseContent.innerHTML = `
                <pre class="text-xs p-4 overflow-x-auto whitespace-nowrap">${escapeHtml(text)}</pre>
            `;
        }
        
        showToast('Request successful!', 'success');
        
    } catch (error) {
        console.error('❌ API Request Error:', error);
        
        const errorMessage = error.message || 'Unknown error occurred';
        responseContent.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-triangle text-2xl text-red-400 mb-3"></i>
                <div class="text-sm font-medium text-red-400">Error</div>
                <div class="text-xs text-gray-400 mt-1">${escapeHtml(errorMessage)}</div>
            </div>
        `;
        responseStatus.textContent = 'Error';
        responseStatus.className = 'text-xs px-2 py-1 rounded bg-red-500/20 text-red-400';
        responseTime.textContent = '0ms';
        
        showToast(`Request failed: ${errorMessage}`, 'error');
    }
};

window.clearResponse = function(catIndex, endpointIndex) {
    const form = document.getElementById(`form-${catIndex}-${endpointIndex}`);
    const responseDiv = document.getElementById(`response-${catIndex}-${endpointIndex}`);
    
    if (form) {
        const inputs = form.querySelectorAll('input[type="text"]');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('border-red-500');
        });
    }
    
    if (responseDiv) {
        responseDiv.classList.add('hidden');
    }
    
    updateRequestUrl(catIndex, endpointIndex);
    showToast('Form cleared', 'info');
};

window.copyUrl = function(catIndex, endpointIndex) {
    const urlDisplay = document.getElementById(`url-display-${catIndex}-${endpointIndex}`);
    if (urlDisplay) {
        const url = window.location.origin + urlDisplay.textContent;
        
        navigator.clipboard.writeText(url).then(() => {
            showToast('URL copied!', 'success');
        }).catch(err => {
            console.error('Failed to copy URL:', err);
            showToast('Failed to copy URL', 'error');
        });
    }
};

window.copyResponse = function(catIndex, endpointIndex) {
    const responseContent = document.getElementById(`response-content-${catIndex}-${endpointIndex}`);
    if (responseContent) {
        const text = responseContent.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            showToast('Response copied!', 'success');
        }).catch(err => {
            console.error('Failed to copy response:', err);
            showToast('Failed to copy response', 'error');
        });
    }
};

window.updateRequestUrl = function(catIndex, endpointIndex) {
    const form = document.getElementById(`form-${catIndex}-${endpointIndex}`);
    if (!form) return { url: '', hasErrors: false };
    
    const baseUrl = settings.categories[catIndex].items[endpointIndex].path.split('?')[0];
    const queryParams = new URLSearchParams();
    let hasErrors = false;
    
    const inputs = form.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
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
};

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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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
    
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }, 1000);
}

// Initialize search dan event listeners
function initializeSearch() {
    allApiItems = [];
    
    const apiItems = document.querySelectorAll('.api-item');
    apiItems.forEach(item => {
        const name = item.getAttribute('data-alias') || '';
        const desc = item.getAttribute('data-description') || '';
        const path = item.getAttribute('data-path') || '';
        const category = item.getAttribute('data-category') || '';
        
        allApiItems.push({
            element: item,
            name: name.toLowerCase(),
            desc: desc.toLowerCase(),
            path: path.toLowerCase(),
            category: category.toLowerCase()
        });
    });
    
    console.log(`🔍 Search initialized with ${allApiItems.length} items`);
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const noResults = document.getElementById('noResults');
            
            if (!searchTerm) {
                document.querySelectorAll('.category-group').forEach(group => {
                    group.style.display = '';
                });
                document.querySelectorAll('.api-item').forEach(item => {
                    item.style.display = '';
                });
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
                
                if (matches && item.element) {
                    item.element.style.display = '';
                    const categoryGroup = item.element.closest('.category-group');
                    if (categoryGroup) {
                        categoryGroup.style.display = '';
                    }
                    visibleCount++;
                } else if (item.element) {
                    item.element.style.display = 'none';
                }
            });
            
            document.querySelectorAll('.category-group').forEach(category => {
                const hasVisible = category.querySelector('.api-item[style=""]') || 
                                 category.querySelector('.api-item:not([style*="none"])');
                category.style.display = hasVisible ? '' : 'none';
            });
            
            noResults.classList.toggle('hidden', visibleCount > 0);
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.matches('input[type="text"]')) {
            if (e.target.closest('form')) {
                const form = e.target.closest('form');
                const formId = form.id;
                
                const parts = formId.split('-');
                if (parts.length >= 3) {
                    const catIndex = parseInt(parts[1]);
                    const endpointIndex = parseInt(parts[2]);
                    
                    if (!isNaN(catIndex) && !isNaN(endpointIndex) && 
                        settings.categories && 
                        settings.categories[catIndex] && 
                        settings.categories[catIndex].items[endpointIndex]) {
                        
                        const item = settings.categories[catIndex].items[endpointIndex];
                        executeRequest(e, catIndex, endpointIndex, item.method || 'GET', item.path, 'application/json');
                    }
                }
            }
        }
    });
}

// Parameter handling functions
function initializeEndpointParameters(catIndex, endpointIndex, item) {
    const paramsContainer = document.getElementById(`params-container-${catIndex}-${endpointIndex}`);
    if (!paramsContainer) return;
    
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
                class="w-full px-3 py-2 border border-gray-600 text-sm focus:outline-none focus:border-indigo-500 bg-gray-700 placeholder:text-slate-500 rounded"
                placeholder="${param.description}"
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
                type: getParamType(key),
                description: getParamDescription(key)
            });
        }
    }
    
    return params;
}

function getParamType(paramName) {
    const types = {
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
    return types[paramName] || 'string';
}

function getParamDescription(paramName) {
    const descriptions = {
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
    return descriptions[paramName] || paramName;
}
