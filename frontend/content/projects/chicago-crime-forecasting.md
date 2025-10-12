# Chicago Crimes Forecasting & Hotspot Analysis

## Overview
A comprehensive data engineering project that analyzes 7.2M crime records from Chicago's open data portal using GCP's Medallion Architecture. The project achieved significant performance improvements through geospatial clustering and optimized data storage.

## Key Achievements
- **74.8% storage reduction** through efficient data partitioning
- **10× query speedup** using H3 geospatial clustering
- **85k hotspots identified** with 99% geocoding accuracy
- **Interactive dashboard** with real-time filtering

## Technical Implementation

### Data Architecture
- **GCP BigQuery** as the data warehouse
- **Medallion Architecture** (Bronze, Silver, Gold layers)
- **H3 geospatial clustering** for efficient spatial queries
- **DBSCAN clustering** for hotspot identification

### Data Processing Pipeline
1. **Data Ingestion**: Automated ETL from Chicago Data Portal
2. **Data Cleaning**: Standardized addresses, coordinates, and timestamps
3. **Geospatial Processing**: H3 hexagon clustering for spatial aggregation
4. **Hotspot Analysis**: DBSCAN clustering to identify crime patterns
5. **Visualization**: Streamlit dashboard with interactive maps

### Performance Optimizations
- **Partitioned tables** by date and location
- **Clustered columns** for faster queries
- **Materialized views** for common aggregations
- **Cached results** for dashboard interactions

## Technologies Used
- **GCP BigQuery** - Data warehouse and analytics
- **Python** - Data processing and analysis
- **Pandas & GeoPandas** - Data manipulation and geospatial operations
- **H3** - Geospatial indexing system
- **DBSCAN** - Density-based clustering
- **Streamlit** - Interactive dashboard
- **Plotly** - Interactive visualizations

## Results
The project successfully processed 7.2M crime records and identified 85,000 distinct hotspots across Chicago. The optimized data structure reduced storage costs by 74.8% while improving query performance by 10×, enabling real-time analysis of crime patterns and trends.

## Live Demo
[View Interactive Dashboard](https://chicago-crimes-dashboard.streamlit.app)

## GitHub Repository
[View Source Code](https://github.com/Ntropy86/chicago-crimes-analysis)