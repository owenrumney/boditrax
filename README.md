# 📊 Boditrax Visualiser

A privacy-first, client-side web application designed to turn your raw **Boditrax** body composition exports into clear, actionable health insights.

![Boditrax Visualiser Demo](.github/images/demo.gif)

## ✨ Features

- **Privacy First**: 100% client-side analysis. Your health data never leaves your browser and is never uploaded to a server.
- **Interactive Dashboard**: Visualize your progress with beautiful, high-performance charts:
  - **Weight Journey**: Track total weight, muscle, and fat mass over time.
  - **Body Composition**: Stacked analysis of your body's makeup.
  - **Metabolic Age vs. Actual Age**: See how your internal health compares to your years.
  - **Metabolic Health**: Track Basal Metabolic Rate (BMR), Visceral Fat, and BMI.
  - **Advanced Metrics**: Deep dive into Water Balance, Bone Mass, and Muscle Quality scores.
- **Smart Time Filters**: Zoom into your recent progress with 3-month, 6-month, and 12-month views.
- **Automated Insights**: Rule-based engine that detects "Composition Wins," "Plateaus," and "Metabolic Age Gains" automatically.
- **Pro Navigation**: Click summary tiles to instantly scroll and highlight specific charts.

## 🚀 Getting Started

1. **Export your data**: In the Boditrax App, go to **Settings** > **Data and Privacy** > **Download Data**.
2. **Open the Visualiser**: Launch the [Boditrax Visualiser](https://boditrax-visualiser.netlify.app).
3. **Upload**: Drag and drop your CSV file onto the dashboard.
4. **Analyse**: Explore your trends and insights!

## 🛠 Tech Stack

- **Charts**: [Chart.js](https://www.chartjs.org/) for high-performance visualisations.
- **Styling**: Vanilla CSS with a customized, modern dark theme.
- **Logic**: Pure Modern JavaScript (ES6+).
- **Date Handling**: `date-fns` for robust time series analysis.

## 🔒 Privacy Notice

This application is built with a **Privacy-by-Design** philosophy. 
- No tracking or analytics.
- No backend database.
- Files are parsed locally using the [File API](https://developer.mozilla.org/en-US/docs/Web/API/File).

## 📄 License

MIT License. See `LICENSE` for more details.
