/**
 * Chart Manager handles the creation and updates of Chart.js instances.
 */
export class ChartManager {
    constructor() {
        this.charts = {};
        
        // Default Chart.js settings for the dark theme
        Chart.defaults.color = '#94a3b8'; // text-secondary
        Chart.defaults.borderColor = '#334155'; // border-color
        Chart.defaults.font.family = "'Inter', sans-serif";
    }

    /**
     * Create the primary Weight Journey chart
     */
    createWeightJourneyChart(canvasId, scans) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        const data = {
            datasets: [
                {
                    label: 'Total Weight',
                    data: scans.map(s => ({ x: s.date, y: s.BodyWeight })),
                    borderColor: '#38bdf8', // accent-blue
                    backgroundColor: '#38bdf833',
                    borderWidth: 3,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    fill: false
                },
                {
                    label: 'Muscle Mass',
                    data: scans.map(s => ({ x: s.date, y: s.MuscleMass })),
                    borderColor: '#4ade80', // accent-green
                    backgroundColor: '#4ade8033',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3,
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: 'Fat Mass',
                    data: scans.map(s => ({ x: s.date, y: s.FatMass })),
                    borderColor: '#f43f5e', // accent-red
                    backgroundColor: '#f43f5e33',
                    borderWidth: 2,
                    borderDash: [2, 2],
                    tension: 0.3,
                    pointRadius: 0,
                    fill: false
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            tooltipFormat: 'dd MMM yyyy',
                            displayFormats: {
                                month: 'MMM yyyy',
                                day: 'dd MMM'
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Mass (kg)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f8fafc',
                        bodyColor: '#f8fafc',
                        borderColor: '#334155',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6
                    }
                }
            }
        };

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        this.charts[canvasId] = new Chart(ctx, config);
    }

    /**
     * Create a specific composition chart (stacked bar)
     */
    createCompositionChart(canvasId, scans) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Only show last 15 scans for the bar chart to keep it readable
        // and filter to only those that have the required metrics
        const compositeScans = scans
            .filter(s => s.MuscleMass && s.FatMass)
            .slice(-15);

        const data = {
            labels: compositeScans.map(s => s.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })),
            datasets: [
                {
                    label: 'Muscle Mass',
                    data: compositeScans.map(s => s.MuscleMass),
                    backgroundColor: '#4ade80cc',
                },
                {
                    label: 'Fat Mass',
                    data: compositeScans.map(s => s.FatMass),
                    backgroundColor: '#f43f5ecc',
                },
                {
                    label: 'Other (Bone/Water)',
                    data: compositeScans.map(s => s.BodyWeight - s.MuscleMass - s.FatMass),
                    backgroundColor: '#94a3b866',
                }
            ]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false }
                    },
                    y: {
                        stacked: true,
                        title: { display: true, text: 'Mass (kg)' }
                    }
                },
                plugins: {
                    legend: { position: 'top', align: 'end' }
                }
            }
        };

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        this.charts[canvasId] = new Chart(ctx, config);
    }

    /**
     * Create a line chart for a single metric with an optional threshold line
     */
    createSingleMetricChart(canvasId, scans, metricKey, label, color, thresholdValue = null, thresholdLabel = '') {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        const validScans = scans.filter(s => s[metricKey] !== undefined);
        
        const datasets = [{
            label: label,
            data: validScans.map(s => ({ x: s.date, y: s[metricKey] })),
            borderColor: color,
            backgroundColor: color + '33',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 2,
            fill: true
        }];

        if (thresholdValue !== null) {
            datasets.push({
                label: thresholdLabel,
                data: validScans.map(s => ({ x: s.date, y: thresholdValue })),
                borderColor: '#94a3b8',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            });
        }

        const config = {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { type: 'time', time: { unit: 'month' }, grid: { display: false } },
                    y: { beginAtZero: false }
                },
                plugins: {
                    legend: { position: 'top', align: 'end' }
                }
            }
        };

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        this.charts[canvasId] = new Chart(ctx, config);
    }

    /**
     * Specialized Metabolic Age Chart with Actual Age reference
     */
    createMetabolicAgeChart(canvasId, scans) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const validScans = scans.filter(s => s.MetabolicAge !== undefined);

        const data = {
            datasets: [
                {
                    label: 'Metabolic Age',
                    data: validScans.map(s => ({ x: s.date, y: s.MetabolicAge })),
                    borderColor: '#c084fc', // purple
                    backgroundColor: '#c084fc33',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Actual Age',
                    data: validScans.map(s => ({ x: s.date, y: s.Age })),
                    borderColor: '#94a3b8',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { type: 'time', time: { unit: 'month' }, grid: { display: false } },
                    y: { beginAtZero: false }
                },
                plugins: {
                    legend: { position: 'top', align: 'end' }
                }
            }
        };

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        this.charts[canvasId] = new Chart(ctx, config);
    }

    /**
     * Create a line chart with multiple metrics for comparison (e.g., Water types)
     */
    createMultiMetricChart(canvasId, scans, metrics, label) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        const datasets = metrics.map(m => ({
            label: m.label,
            data: scans
                .filter(s => s[m.key] !== undefined)
                .map(s => ({ x: s.date, y: s[m.key] })),
            borderColor: m.color,
            backgroundColor: m.color + '22',
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 1,
            fill: false
        }));

        const config = {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { type: 'time', time: { unit: 'month' }, grid: { display: false } },
                    y: { beginAtZero: false, title: { display: true, text: label } }
                },
                plugins: {
                    legend: { position: 'top', align: 'end' }
                }
            }
        };

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        this.charts[canvasId] = new Chart(ctx, config);
    }
}
