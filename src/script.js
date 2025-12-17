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
                showErrorMessage(err);
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
            const newNumber = settings.links
document.getElementById("contactLink").href = `${newNumber}`;
document.getElementById("titleApi"). textContent = settings.name
document.getElementById("descApi"). textContent = settings.description
document.getElementById("footer"). textContent = `© 2025 ${settings.creator} - ${settings.name}`
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
            
            // Initialize search
            initializeSearch();
        }

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
                        id="param-${catIndex}-${endpointIndex}-${param.name}"
                        ${param.name === 'apikey' ? '' : ''}
                    >
                                       
                </div>`;
            });
            
            paramsContainer.innerHTML = paramsHtml;
            
            // Initial URL update
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
        }

        function setupEventListeners() {
            // Search functionality
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase().trim();
                const noResults = document.getElementById('noResults');
                
                if (!searchTerm) {
                    // Show all
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
                
                // Search through all items
                allApiItems.forEach(item => {
                    const matches = 
                        item.name.includes(searchTerm) || 
                        item.desc.includes(searchTerm) || 
                        item.path.includes(searchTerm) ||
                        item.category.includes(searchTerm);
                    
                    if (matches && item.element) {
                        item.element.style.display = '';
                        // Show parent category
                        const categoryGroup = item.element.closest('.category-group');
                        if (categoryGroup) {
                            categoryGroup.style.display = '';
                        }
                        visibleCount++;
                    } else if (item.element) {
                        item.element.style.display = 'none';
                    }
                });
                
                // Hide categories with no visible items
                document.querySelectorAll('.category-group').forEach(category => {
                    const hasVisible = category.querySelector('.api-item[style=""]') || 
                                     category.querySelector('.api-item:not([style*="none"])');
                    if (!hasVisible) {
                        category.style.display = 'none';
                    }
                });
                
                // Show/hide no results
                noResults.classList.toggle('hidden', visibleCount > 0);
            });
            
            // Enter key support
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

        function toggleCategory(index) {
            const category = document.getElementById(`category-${index}`);
            const icon = document.getElementById(`category-icon-${index}`);
            if (category.classList.contains('hidden')) {
                category.classList.remove('hidden');
                icon.textContent = 'expand_less';
            } else {
                category.classList.add('hidden');
                icon.textContent = 'expand_more';
            }
        }

        function toggleEndpoint(catIndex, endpointIndex) {
            const endpoint = document.getElementById(`endpoint-${catIndex}-${endpointIndex}`);
            const icon = document.getElementById(`endpoint-icon-${catIndex}-${endpointIndex}`);
            if (endpoint.classList.contains('hidden')) {
                endpoint.classList.remove('hidden');
                icon.textContent = 'expand_less';
            } else {
                endpoint.classList.add('hidden');
                icon.textContent = 'expand_more';
            }
        }

        function updateRequestUrl(catIndex, endpointIndex) {
            const form = document.getElementById(`form-${catIndex}-${endpointIndex}`);
            if (!form) return { url: '', hasErrors: false };
            
            const baseUrl = settings.categories[catIndex].items[endpointIndex].path.split('?')[0];
            const queryParams = new URLSearchParams();
            let hasErrors = false;
            
            // Get all input values
            const inputs = form.querySelectorAll('input[type="text"]');
            inputs.forEach(input => {
                const paramName = input.name;
                const paramValue = input.value.trim();
                
                // Clear previous error
                input.classList.remove('border-red-500');
                
                // Validate required fields
                if (input.required && !paramValue) {
                    hasErrors = true;
                }
                
                // Add to query params
                if (paramValue) {
                    queryParams.set(paramName, paramValue);
                }
            });
            
            // Build URL
            const url = baseUrl + '?' + queryParams.toString();
            const urlDisplay = document.getElementById(`url-display-${catIndex}-${endpointIndex}`);
            if (urlDisplay) {
                urlDisplay.textContent = url;
            }
            
            return { url, hasErrors };
        }

        async function executeRequest(event, catIndex, endpointIndex, method, path, produces) {
            event.preventDefault();
            
            // Update URL and validate
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
                console.log('Request URL:', url);
                
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
                
                // Get content type
                const contentType = response.headers.get('content-type') || '';
                
                // Update response info
                responseStatus.textContent = `${response.status} OK`;
                responseStatus.className = 'text-xs px-2 py-1 rounded bg-green-500/20 text-green-400';
                responseTime.textContent = `${responseTimeMs}ms`;
                
                // Handle different content types
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
                console.error('API Request Error:', error);
                
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
        }

        function clearResponse(catIndex, endpointIndex) {
            const form = document.getElementById(`form-${catIndex}-${endpointIndex}`);
            const responseDiv = document.getElementById(`response-${catIndex}-${endpointIndex}`);
            
            // Clear inputs
            const inputs = form.querySelectorAll('input[type="text"]');
            inputs.forEach(input => {
                if (input.name === 'apikey') {
                    input.value = '';
                } else {
                    input.value = '';
                }
                input.classList.remove('border-red-500');
            });
            
            // Hide response
            responseDiv.classList.add('hidden');
            
            // Update URL
            updateRequestUrl(catIndex, endpointIndex);
            
            showToast('Form cleared', 'info');
        }

        function copyUrl(catIndex, endpointIndex) {
            const urlDisplay = document.getElementById(`url-display-${catIndex}-${endpointIndex}`);
            const url = window.location.origin + urlDisplay.textContent;
            
            navigator.clipboard.writeText(url).then(() => {
                showToast('URL copied!', 'success');
            }).catch(err => {
                console.error('Failed to copy URL:', err);
                showToast('Failed to copy URL', 'error');
            });
        }

        function copyResponse(catIndex, endpointIndex) {
            const responseContent = document.getElementById(`response-content-${catIndex}-${endpointIndex}`);
            const text = responseContent.textContent;
            
            navigator.clipboard.writeText(text).then(() => {
                showToast('Response copied!', 'success');
            }).catch(err => {
                console.error('Failed to copy response:', err);
                showToast('Failed to copy response', 'error');
            });
        }

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
            loadingScreen.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-wifi text-3xl text-slate-400 mb-4"></i>
                    <p class="text-sm text-slate-400">${err ? err : "Using demo configuration"}</p>
                </div>
            `;
            
            settings = getDefaultSettings();
            setupUI();
            loadAPIData();
            setupEventListeners();
            updateActiveUsers();
            
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => loadingScreen.style.display = 'none', 300);
            }, 1000);
        }

        // Global functions
        window.toggleCategory = toggleCategory;
        window.toggleEndpoint = toggleEndpoint;
        window.executeRequest = executeRequest;
        window.clearResponse = clearResponse;
        window.copyUrl = copyUrl;
        window.copyResponse = copyResponse;
        window.updateRequestUrl = updateRequestUrl;
