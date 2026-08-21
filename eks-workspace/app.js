// Apple-inspired Minimal Server Dashboard Logic

document.addEventListener('DOMContentLoaded', () => {
    // State management
    const state = {
        isDarkTheme: true,
        httpdActive: true,
        httpdPid: 10245,
        uptimeSeconds: 154820, 
        cpuUsage: 14,
        memUsage: 3.2, 
        memTotal: 8.0,
        netTraffic: 180, 
        activeTab: 'dashboard',
        logs: [],
        responseCodes: {
            '200 OK': 4520,
            '301/302 Redirect': 240,
            '404 Not Found': 85,
            '500 Internal Error': 12
        }
    };

    // DOM Elements
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const mainStatusDot = document.getElementById('main-status-dot');
    const mainStatusText = document.getElementById('main-status-text');
    const txtCpuUsage = document.getElementById('txt-cpu-usage');
    const txtMemUsage = document.getElementById('txt-mem-usage');
    const txtNetworkTraffic = document.getElementById('txt-network-traffic');
    const txtUptime = document.getElementById('txt-uptime');
    const badgeInstanceId = document.getElementById('badge-instance-id');
    const metaInstanceId = document.getElementById('meta-instance-id');
    const metaPublicIp = document.getElementById('meta-public-ip');
    
    const httpdStatusBadge = document.getElementById('httpd-status-badge');
    const txtHttpdPid = document.getElementById('txt-httpd-pid');
    const btnServiceStop = document.getElementById('btn-service-stop');
    const btnServiceStart = document.getElementById('btn-service-start');
    const btnServiceRestart = document.getElementById('btn-service-restart');
    
    const logTerminal = document.getElementById('log-terminal');
    const btnClearLogs = document.getElementById('btn-clear-logs');
    const btnRefresh = document.getElementById('btn-refresh');
    
    const navItems = {
        dashboard: document.getElementById('btn-nav-dashboard'),
        metadata: document.getElementById('btn-nav-metadata'),
        logs: document.getElementById('btn-nav-logs')
    };
    
    const views = {
        dashboard: document.getElementById('view-dashboard'),
        metadata: document.getElementById('view-metadata'),
        logs: document.getElementById('view-logs')
    };

    let telemetryChart;
    let responseChart;

    // --- 1. AWS Instance Configuration Initialization ---
    function initAwsMetadata() {
        const instanceId = 'i-0' + Math.random().toString(16).substr(2, 16);
        const octets = [54, Math.floor(Math.random() * 80) + 100, Math.floor(Math.random() * 255), Math.floor(Math.random() * 254) + 1];
        const publicIp = octets.join('.');
        
        badgeInstanceId.textContent = instanceId;
        if (metaInstanceId) metaInstanceId.textContent = instanceId;
        if (metaPublicIp) metaPublicIp.textContent = publicIp;

        // Add copy event to copyable items
        document.querySelectorAll('.copyable').forEach(item => {
            item.addEventListener('click', () => {
                const text = item.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = item.innerHTML;
                    item.innerHTML = `<span style="color: var(--success)"><i class="fa-solid fa-check"></i> Copied</span>`;
                    setTimeout(() => {
                        item.innerHTML = originalText;
                    }, 1000);
                });
            });
        });
    }

    // --- 2. Navigation & Views ---
    function setupNavigation() {
        Object.keys(navItems).forEach(key => {
            navItems[key].addEventListener('click', (e) => {
                e.preventDefault();
                // Remove active classes
                Object.values(navItems).forEach(el => el.classList.remove('active'));
                Object.values(views).forEach(el => el.classList.remove('active'));
                
                // Set current active
                navItems[key].classList.add('active');
                views[key].classList.add('active');
                state.activeTab = key;

                if (key === 'logs') {
                    renderFullLogList();
                }
            });
        });
    }

    // --- 3. Light / Dark Theme Toggle (Apple Styles) ---
    themeToggleBtn.addEventListener('click', () => {
        state.isDarkTheme = !state.isDarkTheme;
        if (state.isDarkTheme) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeToggleBtn.innerHTML = `<i class="fa-solid fa-moon"></i> <span>Dark Mode</span>`;
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeToggleBtn.innerHTML = `<i class="fa-solid fa-sun"></i> <span>Light Mode</span>`;
        }
        updateChartTheme();
    });

    function updateChartTheme() {
        const textColor = state.isDarkTheme ? '#86868b' : '#6e6e73';
        const gridColor = state.isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

        if (telemetryChart) {
            telemetryChart.options.scales.x.grid.color = gridColor;
            telemetryChart.options.scales.x.ticks.color = textColor;
            telemetryChart.options.scales.y.grid.color = gridColor;
            telemetryChart.options.scales.y.ticks.color = textColor;
            telemetryChart.options.plugins.legend.labels.color = textColor;
            telemetryChart.update();
        }
        if (responseChart) {
            responseChart.options.plugins.legend.labels.color = textColor;
            responseChart.update();
        }
    }

    // --- 4. Charts Initialization (Apple Minimal Stocks/Health style) ---
    function initCharts() {
        const ctxTelemetry = document.getElementById('telemetryChart').getContext('2d');
        const timeLabels = Array.from({length: 15}, (_, i) => `${15 - i}s ago`);
        
        telemetryChart = new Chart(ctxTelemetry, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: 'CPU Usage (%)',
                        data: Array.from({length: 15}, () => Math.floor(Math.random() * 8) + 12),
                        borderColor: '#0071e3', // Apple Blue
                        backgroundColor: 'rgba(0, 113, 227, 0.03)',
                        fill: true,
                        tension: 0.4, // Smooth curve
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Network (Kbps)',
                        data: Array.from({length: 15}, () => Math.floor(Math.random() * 100) + 120),
                        borderColor: '#ff9500', // Apple Orange
                        backgroundColor: 'rgba(255, 149, 0, 0.02)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#86868b',
                            boxWidth: 12,
                            boxHeight: 12,
                            font: { family: 'Inter', size: 12, weight: '500' }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#86868b', font: { size: 10 } }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#86868b', font: { size: 10 } }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: 0,
                        max: 1500,
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#86868b', font: { size: 10 } }
                    }
                }
            }
        });

        // Response Distribution Doughnut Chart (Apple Health Ring style)
        const ctxResponse = document.getElementById('responseChart').getContext('2d');
        responseChart = new Chart(ctxResponse, {
            type: 'doughnut',
            data: {
                labels: Object.keys(state.responseCodes),
                datasets: [{
                    data: Object.values(state.responseCodes),
                    backgroundColor: [
                        '#34c759', // 200 OK (Apple Green)
                        '#0071e3', // Redirect (Apple Blue)
                        '#ff9500', // 404 (Apple Orange)
                        '#ff3b30'  // 500 (Apple Red)
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#86868b',
                            boxWidth: 8,
                            font: { family: 'Inter', size: 11, weight: '500' },
                            padding: 12
                        }
                    }
                },
                cutout: '80%' // Thinner health ring feel
            }
        });
    }

    // --- 5. System Status Uptime Formatter ---
    function formatUptime(sec) {
        const days = Math.floor(sec / (3600 * 24));
        const hours = Math.floor((sec % (3600 * 24)) / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    }

    // --- 6. Simulate Access Logs & System Logs ---
    const ipPool = ['192.168.1.15', '203.0.113.88', '198.51.100.42', '172.16.8.5', '10.0.0.12', '54.210.4.99'];
    const endpoints = ['/index.html', '/style.css', '/app.js', '/api/v1/status', '/images/aws-logo.png', '/api/v1/users', '/login', '/wp-admin/setup-config.php'];
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/114.0.0.0',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15',
        'AWS Security Scanner v1.2',
        'curl/7.88.1'
    ];

    function generateLogLine() {
        if (!state.httpdActive) return null;
        
        const ip = ipPool[Math.floor(Math.random() * ipPool.length)];
        const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
        
        const rand = Math.random();
        let status = 200;
        let bytes = Math.floor(Math.random() * 8000) + 500;
        
        if (rand > 0.96) {
            status = 500;
            bytes = 241;
            state.responseCodes['500 Internal Error']++;
        } else if (rand > 0.91) {
            status = 404;
            bytes = 153;
            state.responseCodes['404 Not Found']++;
        } else if (rand > 0.86) {
            status = 301;
            bytes = 0;
            state.responseCodes['301/302 Redirect']++;
        } else {
            state.responseCodes['200 OK']++;
        }
        
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formatZero = (num) => String(num).padStart(2, '0');
        const timestamp = `${formatZero(now.getDate())}/${months[now.getMonth()]}/${now.getFullYear()}:${formatZero(now.getHours())}:${formatZero(now.getMinutes())}:${formatZero(now.getSeconds())} +0900`;
        
        const method = endpoint === '/login' || endpoint.includes('config') ? 'POST' : 'GET';
        const log = `${ip} - - [${timestamp}] "${method} ${endpoint} HTTP/1.1" ${status} ${bytes} "-" "${ua}"`;
        
        state.logs.push({ text: log, status, ip, endpoint, timestamp });
        if (state.logs.length > 200) state.logs.shift();

        if (responseChart) {
            responseChart.data.datasets[0].data = Object.values(state.responseCodes);
            responseChart.update('none');
        }

        return { log, status };
    }

    function appendToTerminal(lineText, type = 'access') {
        const div = document.createElement('div');
        div.className = `log-line ${type}`;
        div.textContent = lineText;
        logTerminal.appendChild(div);
        
        logTerminal.scrollTop = logTerminal.scrollHeight;
        
        while (logTerminal.children.length > 25) {
            logTerminal.removeChild(logTerminal.firstChild);
        }
    }

    // --- 7. Apache control simulations ---
    function updateServiceUI() {
        if (state.httpdActive) {
            httpdStatusBadge.textContent = 'Running';
            httpdStatusBadge.className = 'badge status-active';
            btnServiceStop.disabled = false;
            btnServiceStart.disabled = true;
            btnServiceRestart.disabled = false;
            txtHttpdPid.textContent = state.httpdPid;
            
            mainStatusDot.className = 'status-dot green';
            mainStatusText.textContent = 'Server Online';
            
            document.getElementById('trend-uptime').innerHTML = `<i class="fa-solid fa-circle-play"></i> Running`;
            document.getElementById('trend-uptime').className = 'stat-trend text-success';
        } else {
            httpdStatusBadge.textContent = 'Stopped';
            httpdStatusBadge.className = 'badge status-inactive';
            btnServiceStop.disabled = true;
            btnServiceStart.disabled = false;
            btnServiceRestart.disabled = true;
            txtHttpdPid.textContent = '--';
            
            mainStatusDot.className = 'status-dot red';
            mainStatusText.textContent = 'Service Offline';

            document.getElementById('trend-uptime').innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Stopped`;
            document.getElementById('trend-uptime').className = 'stat-trend text-danger';
        }
    }

    btnServiceStop.addEventListener('click', () => {
        state.httpdActive = false;
        updateServiceUI();
        appendToTerminal(`[systemd] Stopping apache Web Server...`, 'system');
        setTimeout(() => {
            appendToTerminal(`[systemd] Stopped Apache httpd service.`, 'system');
        }, 200);
    });

    btnServiceStart.addEventListener('click', () => {
        state.httpdActive = true;
        state.httpdPid = Math.floor(Math.random() * 5000) + 10000;
        updateServiceUI();
        appendToTerminal(`[systemd] Starting apache Web Server...`, 'system');
        setTimeout(() => {
            appendToTerminal(`[systemd] Started Apache httpd service.`, 'system');
        }, 200);
    });

    btnServiceRestart.addEventListener('click', () => {
        httpdStatusBadge.textContent = 'Activating';
        httpdStatusBadge.className = 'badge status-transition';
        btnServiceStop.disabled = true;
        btnServiceRestart.disabled = true;
        
        appendToTerminal(`[systemd] Stopping apache Web Server...`, 'system');
        
        setTimeout(() => {
            appendToTerminal(`[systemd] Stopped Apache httpd service.`, 'system');
            appendToTerminal(`[systemd] Starting apache Web Server...`, 'system');
            
            setTimeout(() => {
                state.httpdPid = Math.floor(Math.random() * 5000) + 10000;
                state.httpdActive = true;
                updateServiceUI();
                appendToTerminal(`[systemd] Started Apache httpd service.`, 'system');
            }, 400);
        }, 300);
    });

    btnClearLogs.addEventListener('click', () => {
        logTerminal.innerHTML = `<div class="log-line system">[system] Log terminal cleared.</div>`;
    });

    // --- 8. Intervals for Stats Telemetries ---
    setInterval(() => {
        if (state.httpdActive) {
            state.uptimeSeconds++;
            txtUptime.textContent = formatUptime(state.uptimeSeconds);
            
            state.cpuUsage = Math.floor(Math.random() * 10) + (Math.random() > 0.85 ? 20 : 8);
            state.netTraffic = Math.floor(Math.random() * 200) + (Math.random() > 0.85 ? 400 : 90);
            state.memUsage = Math.min(7.9, Math.max(1.8, state.memUsage + (Math.random() * 0.1 - 0.05)));
        } else {
            state.cpuUsage = 0;
            state.netTraffic = 0;
            state.memUsage = Math.max(1.6, state.memUsage - 0.03);
        }

        txtCpuUsage.textContent = `${state.cpuUsage}%`;
        txtMemUsage.textContent = `${state.memUsage.toFixed(1)} / ${state.memTotal.toFixed(1)} GB`;
        txtNetworkTraffic.textContent = `${state.netTraffic.toFixed(0)} Kbps`;
        
        if (telemetryChart) {
            telemetryChart.data.datasets[0].data.shift();
            telemetryChart.data.datasets[0].data.push(state.cpuUsage);
            
            telemetryChart.data.datasets[1].data.shift();
            telemetryChart.data.datasets[1].data.push(state.netTraffic);
            
            telemetryChart.update('quiet');
        }
    }, 1000);

    setInterval(() => {
        if (state.httpdActive) {
            if (Math.random() > 0.35) {
                const logData = generateLogLine();
                if (logData) {
                    let type = 'access';
                    if (logData.status === 404) type = 'warn';
                    if (logData.status === 500) type = 'error';
                    appendToTerminal(logData.log, type);
                    
                    if (state.activeTab === 'logs') {
                        renderFullLogList();
                    }
                }
            }
        }
    }, 1500);

    btnRefresh.addEventListener('click', () => {
        btnRefresh.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Refreshing`;
        btnRefresh.disabled = true;
        
        setTimeout(() => {
            btnRefresh.innerHTML = `<i class="fa-solid fa-arrow-rotate-right"></i> Refresh`;
            btnRefresh.disabled = false;
            if (state.httpdActive) {
                appendToTerminal(`[info] Telemetry cache refreshed. Running OK.`, 'info');
            }
        }, 500);
    });

    // --- 9. Full Logs View Filtering ---
    const logSearchInput = document.getElementById('log-search');
    const logFilterStatus = document.getElementById('log-filter-status');
    const fullLogList = document.getElementById('full-log-list');

    function renderFullLogList() {
        if (!fullLogList) return;
        
        const filterVal = logFilterStatus.value;
        const searchVal = logSearchInput.value.toLowerCase();
        
        fullLogList.innerHTML = '';
        
        const filtered = state.logs.filter(log => {
            let matchStatus = true;
            if (filterVal === '200') matchStatus = log.status === 200;
            else if (filterVal === '300') matchStatus = log.status >= 300 && log.status < 400;
            else if (filterVal === '400') matchStatus = log.status >= 400 && log.status < 500;
            else if (filterVal === '500') matchStatus = log.status >= 500;
            
            const matchText = log.text.toLowerCase().includes(searchVal);
            return matchStatus && matchText;
        });

        if (filtered.length === 0) {
            fullLogList.innerHTML = `<div class="log-line text-muted">No logs found.</div>`;
            return;
        }

        filtered.slice().reverse().forEach(log => {
            const div = document.createElement('div');
            let type = 'access';
            if (log.status === 404) type = 'warn';
            if (log.status === 500) type = 'error';
            div.className = `log-line ${type}`;
            div.textContent = log.text;
            fullLogList.appendChild(div);
        });
    }

    if (logSearchInput && logFilterStatus) {
        logSearchInput.addEventListener('input', renderFullLogList);
        logFilterStatus.addEventListener('change', renderFullLogList);
    }

    // --- 10. Warmup ---
    for (let i = 0; i < 15; i++) {
        generateLogLine();
    }
    
    state.logs.forEach(log => {
        let type = 'access';
        if (log.status === 404) type = 'warn';
        if (log.status === 500) type = 'error';
        appendToTerminal(log.text, type);
    });

    initAwsMetadata();
    setupNavigation();
    initCharts();
    updateServiceUI();
    
    txtUptime.textContent = formatUptime(state.uptimeSeconds);
});
