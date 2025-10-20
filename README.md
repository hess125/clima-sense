# 🌡️ ClimaSense

**Climate Resilience Intelligence Platform for UAE**

A comprehensive AI-powered geospatial platform that detects, predicts, and visualizes urban heat vulnerability zones across UAE cities.

## ✨ Features

### 🗺️ Interactive Heat Map Dashboard
- Real-time visualization of 47+ Dubai zones
- Heat index, temperature, and vegetation metrics
- Risk classification system (Critical/High/Medium/Low)
- Detailed zone analysis with recommendations

### 🤖 AI Urban Mirage - Predictive Analytics
- 2030 heat forecasts using machine learning
- Multiple development scenario simulations
- ROI analysis for cooling interventions
- Satellite data integration (MODIS, Sentinel-2, Landsat)

### 🧭 CoolPath - Heat-Safe Navigation
- AI-powered route optimization
- Solar exposure and shade analysis
- Real-time temperature-aware pathfinding
- Health and safety recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ (for data processing)

### Installation
```bash
# Clone the repository
git clone https://github.com/hess125/climasense.git
cd climasense

# Install dependencies
npm install

# Generate mock data
cd data-processing
pip install -r requirements.txt
python generate_mock_data.py
python heat_processor.py

# Copy generated data to React app
mkdir -p ../src/data
cp heat_zones.json ../src/data/

# Start development server
cd ..
npm start
```

## 📊 Data Sources

- **MODIS LST**: Surface temperature variations
- **Sentinel-2 SWIR**: Material reflectivity classification  
- **Landsat NDVI/EVI**: Vegetation performance metrics
- **OpenStreetMap**: Urban morphology and building data
- **ML Models**: Random Forest & Gradient Boosting

## 🏗️ Project Structure
```
desert-heatlens/
├── data-processing/          # Python scripts for data generation
├── src/
│   ├── components/          # React components
│   ├── data/               # Generated heat zones data
│   ├── App.js              # Main application
│   └── App.css             # Glassmorphism styles
└── public/                 # Static assets
```

## 🎨 Technology Stack

- **Frontend**: React 18, Recharts, Lucide Icons
- **Styling**: Tailwind CSS, Glassmorphism design
- **Data Processing**: Python, Pandas, Folium
- **Deployment**: Vercel / Netlify ready

## 📈 Performance

- 47 monitored zones across Dubai
- 94% prediction accuracy
- Real-time interactive mapping
- Responsive design for all devices

                    ---
Built with ❤️ for climate resilience in the UAE
                    ---

**ClimaSense** - Making cities cooler, one zone at a time.
