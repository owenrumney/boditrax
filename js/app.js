import { BoditraxParser } from './parser.js';
import { ChartManager } from './charts.js';
import { InsightsEngine } from './insights.js';

class App {
    constructor() {
        this.parser = new BoditraxParser();
        this.chartManager = new ChartManager();
        this.insightsEngine = new InsightsEngine();
        this.data = null;
        this.currentRange = 'all';

        this.initEventListeners();
    }

    initEventListeners() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const resetBtn = document.getElementById('reset-btn');
        const rangeDropdown = document.getElementById('range-dropdown');
        const dropdownTrigger = rangeDropdown.querySelector('.dropdown-trigger');
        const dropdownLabel = document.getElementById('current-range-label');
        const dropdownItems = rangeDropdown.querySelectorAll('.dropdown-item');

        dropdownTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            rangeDropdown.classList.toggle('active');
        });

        dropdownItems.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                const label = item.textContent;
                
                // Update UI
                dropdownLabel.textContent = label;
                dropdownItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                rangeDropdown.classList.remove('active');

                // Update Data
                this.currentRange = value;
                this.renderCharts();
                this.renderInsights();
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            rangeDropdown.classList.remove('active');
        });

        dropZone.addEventListener('click', () => fileInput.click());
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--accent-blue)';
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = 'var(--border-color)';
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border-color)';
            const file = e.dataTransfer.files[0];
            if (file) this.handleFile(file);
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.handleFile(file);
        });

        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data?')) {
                window.location.reload();
            }
        });
    }

    async handleFile(file) {
        if (!file.name.endsWith('.csv')) {
            alert('Please upload a Boditrax CSV file.');
            return;
        }

        try {
            console.log('Reading file:', file.name);
            const text = await file.text();
            this.data = this.parser.parse(text);
            
            if (!this.data.scans || this.data.scans.length === 0) {
                throw new Error('No valid scan data found in the CSV. Please check the file format.');
            }

            this.showDashboard();
        } catch (error) {
            console.error('Application Error:', error);
            alert(`Error: ${error.message}\n\nCheck the browser console (F12) for technical details.`);
        }
    }

    showDashboard() {
        document.getElementById('landing').classList.add('hidden');
        document.getElementById('dashboard').style.display = 'block';
        
        const userGreeting = document.getElementById('user-greeting');
        const name = this.data.userDetails?.['FirstName LastName'];
        
        if (name) {
            userGreeting.textContent = `Hello, ${name.split(' ')[0]} 👋`;
        } else {
            userGreeting.textContent = 'Dashboard';
        }
        
        this.renderSummaries();
        this.renderCharts();
        this.renderInsights();
    }

    getFilteredScans() {
        if (!this.data || !this.data.scans || this.data.scans.length === 0) return [];
        if (this.currentRange === 'all') return this.data.scans;

        // Find the latest scan date to use as a reference point (not "today")
        // This ensures the filter works even if the export is old
        const latestScan = this.data.scans[this.data.scans.length - 1];
        const referenceDate = new Date(latestScan.date);
        
        const months = parseInt(this.currentRange);
        const cutoff = new Date(referenceDate);
        cutoff.setMonth(cutoff.getMonth() - months);

        return this.data.scans.filter(s => s.date >= cutoff);
    }

    renderInsights() {
        const filteredScans = this.getFilteredScans();
        const panel = document.getElementById('insights-panel');
        const container = document.getElementById('insights-container');

        if (filteredScans.length === 0) {
            panel.style.display = 'none';
            return;
        }

        const insights = this.insightsEngine.analyze(filteredScans);
        if (insights.length === 0) {
            panel.style.display = 'none';
            return;
        }

        panel.style.display = 'block';
        container.innerHTML = insights.map(topic => `
            <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); border-left: 4px solid ${this.getInsightColor(topic.type)};">
                <div style="font-weight: 800; margin-bottom: 0.5rem; font-size: 1.1rem;">${topic.title}</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">${topic.description}</div>
            </div>
        `).join('');
    }

    getInsightColor(type) {
        switch (type) {
            case 'success': return 'var(--accent-green)';
            case 'warning': return 'var(--accent-red)';
            case 'info': return 'var(--accent-blue)';
            default: return 'var(--border-color)';
        }
    }

    renderCharts() {
        const scans = this.getFilteredScans();
        
        // Even if empty, we might want to clear or update the charts
        // The individual create methods handle this internally by destroying old instances
        
        this.chartManager.createWeightJourneyChart('weightJourneyChart', scans);
        this.chartManager.createCompositionChart('compositionChart', scans);
        this.chartManager.createMetabolicAgeChart('metabolicAgeChart', scans);
        this.chartManager.createSingleMetricChart('visceralFatChart', scans, 'VisceralFatRating', 'Visceral Fat', '#f43f5e', 9, 'Healthy Threshold (≤9)');
        this.chartManager.createSingleMetricChart('bmiChart', scans, 'BodyMassIndex', 'BMI', '#38bdf8', 25, 'Normal BMI Threshold');
    }

    renderSummaries() {
        const grid = document.getElementById('summary-grid');
        // Find the latest scan that has at least BodyWeight (to avoid empty "login" or partial scans)
        const validScans = this.data.scans.filter(s => s.BodyWeight !== undefined);
        const latest = validScans[validScans.length - 1];
        
        if (!latest) return;

        const metricsToShow = [
            { label: 'Weight', key: 'BodyWeight', unit: 'kg', targetCard: 'card-weight' },
            { label: 'Fat Mass', key: 'FatMass', unit: 'kg', targetCard: 'card-composition' },
            { label: 'Muscle Mass', key: 'MuscleMass', unit: 'kg', targetCard: 'card-composition' },
            { label: 'Visceral Fat', key: 'VisceralFatRating', unit: '', targetCard: 'card-visceral' },
            { label: 'Metabolic Age', key: 'MetabolicAge', unit: 'y', targetCard: 'card-metabolic' }
        ];

        grid.innerHTML = metricsToShow.map(m => `
            <div data-target="${m.targetCard}" style="background: var(--card-bg); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); cursor: pointer; transition: all 0.2s ease;">
                <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">${m.label}</div>
                <div style="font-size: 1.5rem; font-weight: 800;">${latest[m.key] ?? '--'}<span style="font-size: 0.875rem; font-weight: 400; color: var(--text-secondary); margin-left: 0.25rem;">${m.unit}</span></div>
            </div>
        `).join('');

        // Add scroll listeners
        grid.querySelectorAll('[data-target]').forEach(card => {
            card.addEventListener('click', () => {
                const targetId = card.dataset.target;
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Visual feedback
                    element.style.borderColor = 'var(--accent-blue)';
                    setTimeout(() => {
                        element.style.borderColor = 'var(--border-color)';
                    }, 2000);
                }
            });
        });
    }
}

// Initialise the app
new App();
