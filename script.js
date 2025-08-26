// Bot de Tráfico Web - Script principal
class TrafficBot {
    constructor() {
        this.isActive = false;
        this.visitCount = 0;
        this.activeVisitors = 0;
        this.totalTime = 0;
        this.intervals = [];
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
        ];
        this.keywords = [
            'mejores productos', 'comprar online', 'ofertas especiales',
            'reviews productos', 'guía de compra', 'productos recomendados',
            'precio barato', 'comparativa productos', 'mejor calidad precio'
        ];
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    getRandomKeyword() {
        return this.keywords[Math.floor(Math.random() * this.keywords.length)];
    }

    generateCustomCookies() {
        const cookies = {};
        cookies._ga = `GA1.2.${Math.floor(Math.random() * 1000000000)}.${Math.floor(Date.now() / 1000)}`;
        cookies._gid = `GA1.2.${Math.floor(Math.random() * 1000000000)}.${Math.floor(Date.now() / 1000)}`;
        cookies.session_id = Array.from({length: 32}, () => 
            'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
        ).join('');
        cookies.visited_pages = Math.floor(Math.random() * 10) + 1;
        return cookies;
    }

    getTrafficSource(trafficType) {
        switch(trafficType) {
            case 'organic':
                return {
                    referer: `https://www.google.com/search?q=${this.getRandomKeyword().replace(' ', '+')}`,
                    utm_source: 'google',
                    utm_medium: 'organic'
                };
            case 'mixed':
                return Math.random() > 0.5 ? {
                    referer: `https://www.google.com/search?q=${this.getRandomKeyword().replace(' ', '+')}`,
                    utm_source: 'google',
                    utm_medium: 'organic'
                } : {
                    referer: '',
                    utm_source: 'direct',
                    utm_medium: 'none'
                };
            default:
                return {
                    referer: '',
                    utm_source: 'direct',
                    utm_medium: 'none'
                };
        }
    }

    addLogEntry(message, type = 'info') {
        const logDiv = document.getElementById('activityLog');
        const entry = document.createElement('p');
        const timestamp = new Date().toLocaleTimeString();
        
        let typeClass = '';
        switch(type) {
            case 'success': typeClass = 'log-success'; break;
            case 'warning': typeClass = 'log-warning'; break;
            case 'error': typeClass = 'log-error'; break;
            default: typeClass = 'log-info';
        }
        
        entry.className = `mb-1 log-entry ${typeClass}`;
        entry.innerHTML = `[${timestamp}] ${message}`;
        
        logDiv.appendChild(entry);
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    updateStats() {
        document.getElementById('visitCount').textContent = this.visitCount;
        document.getElementById('activeVisitors').textContent = this.activeVisitors;
        
        const avgTime = this.visitCount > 0 ? (this.totalTime / this.visitCount).toFixed(1) : 0;
        document.getElementById('avgTime').textContent = avgTime;
        
        // Actualizar barra de progreso
        const progress = Math.min(100, (this.visitCount * 10));
        document.getElementById('simulationProgress').style.width = `${progress}%`;
        
        // Cambiar color de la barra según el progreso
        const progressBar = document.getElementById('simulationProgress');
        if (progress < 30) {
            progressBar.className = 'progress-bar bg-success';
        } else if (progress < 70) {
            progressBar.className = 'progress-bar bg-warning';
        } else {
            progressBar.className = 'progress-bar bg-danger';
        }
    }

    simulateVisit(visitorId) {
        return new Promise((resolve) => {
            // Simular tiempo de visita aleatorio
            const minTime = parseInt(document.getElementById('minTime').value);
            const maxTime = parseInt(document.getElementById('maxTime').value);
            const stayTime = Math.random() * (maxTime - minTime) + minTime;
            
            this.addLogEntry(`Visitante #${visitorId} iniciando visita (${stayTime.toFixed(1)}s)`, 'info');
            
            // Simular desplazamiento y actividades
            setTimeout(() => {
                this.visitCount++;
                this.totalTime += stayTime;
                this.activeVisitors--;
                
                this.addLogEntry(`Visitante #${visitorId} completó visita`, 'success');
                this.updateStats();
                resolve();
            }, stayTime * 100); // Acelerado para demo
        });
    }

    async startSimulation() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.visitCount = 0;
        this.totalTime = 0;
        
        const concurrentVisitors = parseInt(document.getElementById('concurrentVisitors').value);
        const trafficType = document.getElementById('trafficType').value;
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        
        this.addLogEntry(`Iniciando simulación con ${concurrentVisitors} visitantes concurrentes`, 'success');
        
        // Crear visitantes concurrentes
        for (let i = 0; i < concurrentVisitors; i++) {
            this.createVisitor(i + 1, trafficType);
        }
        
        this.updateStats();
    }

    createVisitor(visitorId, trafficType) {
        if (!this.isActive) return;
        
        this.activeVisitors++;
        this.updateStats();
        
        this.simulateVisit(visitorId).then(() => {
            // Crear nuevo visitante después de completar uno
            setTimeout(() => {
                if (this.isActive) {
                    this.createVisitor(visitorId, trafficType);
                }
            }, Math.random() * 2000 + 1000); // Espera aleatoria entre visitas
        });
    }

    stopSimulation() {
        this.isActive = false;
        this.activeVisitors = 0;
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        
        this.addLogEntry('Simulación detenida', 'warning');
        this.updateStats();
    }
}

// Instancia global del bot
const bot = new TrafficBot();

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Formulario
    document.getElementById('botForm').addEventListener('submit', function(e) {
        e.preventDefault();
        bot.startSimulation();
    });
    
    // Botón de detener
    document.getElementById('stopBtn').addEventListener('click', function() {
        bot.stopSimulation();
    });
    
    // Validación de URL
    document.getElementById('targetUrl').addEventListener('input', function() {
        const url = this.value;
        if (url && !url.match(/^https?:\/\/.+/)) {
            this.setCustomValidity('Por favor ingresa una URL válida (http:// o https://)');
        } else {
            this.setCustomValidity('');
        }
    });
    
    // Inicializar estadísticas
    bot.updateStats();
});

// Función para mostrar manual
function showManual() {
    const manualModal = new bootstrap.Modal(document.getElementById('manualModal'));
    manualModal.show();
}

// Función para exportar estadísticas (simulada)
function exportStats() {
    alert('Función de exportación disponible en versión completa');
}

// Función para resetear estadísticas
function resetStats() {
    if (confirm('¿Estás seguro de resetear las estadísticas?')) {
        bot.visitCount = 0;
        bot.totalTime = 0;
        bot.updateStats();
        document.getElementById('activityLog').innerHTML = '<p class="mb-1">Estadísticas reiniciadas</p>';
    }
}
