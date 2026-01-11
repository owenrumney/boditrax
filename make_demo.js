const fs = require('fs');

const startDate = new Date('2023-01-15T08:00:00');
const endDate = new Date('2026-01-11T08:00:00');
const scans = [];

let currentDate = new Date(startDate);
let scanCount = 0;

while (currentDate <= endDate) {
    const isLastYear = currentDate > new Date('2025-01-01');
    
    let weight, muscle, fat, visceral, metabolicAge, water, icw, bmr, bone, muscleScore, legScore, boditraxScore;

    if (!isLastYear) {
        weight = 100 + (Math.random() * 0.5 - 0.25);
        muscle = 65 + (Math.random() * 0.2 - 0.1);
        fat = 30 + (Math.random() * 0.4 - 0.2);
        visceral = 12;
        metabolicAge = 45;
        water = 52 + (Math.random() * 0.3);
        icw = 30 + (Math.random() * 0.2);
        bmr = 9200 + (Math.random() * 100);
        bone = 3.6;
        muscleScore = 0;
        legScore = 88;
        boditraxScore = 720;
    } else {
        const yearProgress = (currentDate - new Date('2025-01-01')) / (endDate - new Date('2025-01-01'));
        weight = 100 - (15 * yearProgress); 
        muscle = 65 + (4 * yearProgress);   
        fat = 30 - (19 * yearProgress);     
        visceral = Math.max(7, 12 - Math.floor(5 * yearProgress));
        metabolicAge = Math.max(30, 45 - Math.floor(15 * yearProgress));
        water = 52 + (5 * yearProgress);
        icw = 30 + (3 * yearProgress);
        bmr = 9200 + (400 * yearProgress);
        bone = 3.6 + (0.2 * yearProgress);
        muscleScore = yearProgress > 0.8 ? 1 : 0;
        legScore = 88 + (10 * yearProgress);
        boditraxScore = 720 + (150 * yearProgress);
    }

    const bmi = (weight / (1.8 * 1.8)).toFixed(1);
    const dateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()} 8:15:30 AM`;

    const metrics = [
        ['BodyWeight', weight.toFixed(1)],
        ['MuscleMass', muscle.toFixed(1)],
        ['FatMass', fat.toFixed(1)],
        ['VisceralFatRating', visceral],
        ['MetabolicAge', metabolicAge],
        ['BodyMassIndex', bmi],
        ['Age', 40],
        ['Height', 180],
        ['BoneMass', bone.toFixed(1)],
        ['WaterMass', water.toFixed(1)],
        ['IntraCellularWaterMass', icw.toFixed(1)],
        ['BasalMetabolicRatekJ', Math.round(bmr)],
        ['MuscleScore', muscleScore],
        ['LegMuscleScore', Math.round(legScore)],
        ['BoditraxScore', Math.round(boditraxScore)]
    ];

    metrics.forEach(([id, val]) => {
        scans.push(`${id},${val},${dateStr}`);
    });

    currentDate.setDate(currentDate.getDate() + 28);
    scanCount++;
}

const headerColor = `User Details
Email,FirstName LastName,DateOfBirth,Gender
john.doe@example.com,John Doe,5/15/1985 12:00:00 AM,Male
User Physique Details
Height,RecentClothesWeight
180,1
User Scan Details
BodyMetricTypeId,Value,CreatedDate
`;

fs.writeFileSync('john_doe_demo.csv', headerColor + scans.join('\n'));
console.log('Regenerated demo data');
