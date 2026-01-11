/**
 * Insights Engine analyzes body composition trends to provide actionable feedback.
 */
export class InsightsEngine {
    constructor() {}

    /**
     * Analyze scans and return a list of relevant insights
     * @param {Array} scans - Array of scan objects sorted by date
     * @returns {Array} List of insight objects { type, title, description, priority }
     */
    analyze(allScans) {
        const scans = allScans.filter(s => s.BodyWeight !== undefined);
        if (scans.length < 2) return [];

        const insights = [];
        const latest = scans[scans.length - 1];
        const first = scans[0];
        
        // Find a scan from approx ~4 weeks ago
        const fourWeeksAgo = new Date(latest.date);
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        const scanFourWeeksAgo = [...scans].reverse().find(s => s.date <= fourWeeksAgo) || first;

        // 1. Composition Win (Priority 1)
        if (latest.FatMass < scanFourWeeksAgo.FatMass && latest.MuscleMass > scanFourWeeksAgo.MuscleMass) {
            insights.push({
                type: 'success',
                title: 'Composition Win! 🏆',
                description: "You're losing fat and building muscle simultaneously. This is the gold standard for body recomposition.",
                priority: 1
            });
        }

        // 2. Visceral Fat Drop (Priority 1)
        if (scanFourWeeksAgo.VisceralFatRating - latest.VisceralFatRating >= 1) {
            insights.push({
                type: 'success',
                title: 'Internal Health Improving',
                description: `Your visceral fat rating dropped. This is a key indicator of reduced metabolic risk.`,
                priority: 1
            });
        }

        // 3. Muscle Loss Warning (Priority 2)
        const muscleChange = latest.MuscleMass - scanFourWeeksAgo.MuscleMass;
        if (muscleChange < -0.8 && (latest.BodyWeight < scanFourWeeksAgo.BodyWeight)) {
            insights.push({
                type: 'warning',
                title: 'Watch Your Muscle Mass',
                description: "Your weight is dropping, but so is your muscle mass. Consider increasing protein intake and resistance training.",
                priority: 2
            });
        }

        // 4. Plateau Detection (Priority 3)
        const weightDiff = Math.abs(latest.BodyWeight - scanFourWeeksAgo.BodyWeight);
        if (weightDiff < 0.5 && scans.length > 5) {
            insights.push({
                type: 'info',
                title: 'Steady Progress',
                description: "Your weight has been stable for the last 4 weeks. If your fat mass is still decreasing, you're still making progress!",
                priority: 3
            });
        }

        // 5. Metabolic Age Win
        if (latest.MetabolicAge < latest.Age) {
            insights.push({
                type: 'success',
                title: 'Metabolic Athlete',
                description: `Your metabolic age (${latest.MetabolicAge}) is lower than your actual age (${latest.Age}). Keep it up!`,
                priority: 4
            });
        }

        return insights.sort((a, b) => a.priority - b.priority).slice(0, 3);
    }
}
