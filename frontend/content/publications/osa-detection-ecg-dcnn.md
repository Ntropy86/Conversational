---
title: "Hybrid DCNN model for classification and detecting Obstructive Sleep Apnea (OSA) from digitized ECG signals"
authors: "K. Srivastava, N. Kargeti, et al."
venue: "Biomedical Signal Processing and Control"
year: 2023
volume: 84
type: "Journal Paper"
link: "https://www.sciencedirect.com/science/article/abs/pii/S1746809423001878"
tags: ["sleep apnea", "ECG signals", "deep learning", "CNN", "biomedical signal processing"]
preview: "A novel hybrid deep convolutional neural network approach for automated detection and classification of obstructive sleep apnea using digitized ECG signals."
---

# Hybrid DCNN model for classification and detecting Obstructive Sleep Apnea (OSA) from digitized ECG signals

## Abstract

Obstructive Sleep Apnea (OSA) is a prevalent sleep disorder characterized by repeated breathing interruptions during sleep, significantly impacting quality of life and increasing cardiovascular disease risk. This study presents a novel hybrid Deep Convolutional Neural Network (DCNN) model for automated OSA detection and classification using digitized electrocardiogram (ECG) signals.

## Introduction

Obstructive Sleep Apnea affects approximately 936 million adults worldwide, with many cases remaining undiagnosed due to the complexity and cost of traditional polysomnography (PSG) studies. ECG-based detection offers a more accessible and cost-effective alternative for OSA screening and monitoring.

## Methodology

### Dataset
- **Source**: Physionet Apnea-ECG Database
- **Subjects**: 70 subjects (35 OSA patients, 35 healthy controls)
- **Duration**: 8-10 hours of overnight ECG recordings per subject
- **Sampling Rate**: 100 Hz

### Signal Preprocessing
1. **Noise Reduction**: Butterworth bandpass filtering (0.5-40 Hz)
2. **Baseline Correction**: Moving average detrending
3. **Segmentation**: 60-second non-overlapping windows
4. **Normalization**: Z-score standardization

### Hybrid DCNN Architecture

#### Feature Extraction Layers
- **Conv1D Layers**: Multiple 1D convolutional layers for temporal pattern extraction
- **Pooling Layers**: Max pooling for dimensionality reduction
- **Dropout**: Regularization to prevent overfitting

#### Classification Component
- **Dense Layers**: Fully connected layers for final classification
- **Activation**: ReLU for hidden layers, Softmax for output
- **Output**: Binary classification (OSA vs. Normal)

### Model Training
- **Optimizer**: Adam optimizer with learning rate scheduling
- **Loss Function**: Binary cross-entropy
- **Batch Size**: 32
- **Epochs**: 100 with early stopping
- **Validation**: 5-fold cross-validation

## Results

### Performance Metrics
- **Accuracy**: 94.2% ± 1.8%
- **Sensitivity**: 93.7% ± 2.1%
- **Specificity**: 94.8% ± 1.5%
- **F1-Score**: 94.0% ± 1.9%
- **AUC-ROC**: 0.967 ± 0.018

### Comparative Analysis
Our hybrid DCNN model outperformed several baseline methods:
- Traditional SVM: 78.3% accuracy
- Random Forest: 82.1% accuracy
- Standard CNN: 89.5% accuracy
- LSTM: 87.2% accuracy

### Feature Analysis
The model successfully identified key ECG features associated with OSA:
- Heart rate variability patterns
- R-R interval irregularities
- QRS morphology changes
- T-wave amplitude variations

## Technical Implementation

### Deep Learning Framework
- **Platform**: TensorFlow 2.x with Keras API
- **Hardware**: NVIDIA Tesla V100 GPU for training
- **Training Time**: Approximately 4 hours for complete model training

### Signal Processing Pipeline
- **Preprocessing**: Python with SciPy and NumPy
- **Visualization**: Matplotlib for signal analysis and results presentation
- **Data Management**: Pandas for dataset handling and statistical analysis

## Clinical Relevance

### Advantages Over Traditional Methods
1. **Non-invasive**: Single-lead ECG vs. complex PSG setup
2. **Cost-effective**: Reduced equipment and technician requirements
3. **Accessible**: Potential for home-based monitoring
4. **Real-time**: Automated analysis without expert interpretation

### Potential Applications
- **Screening Programs**: Large-scale OSA detection in at-risk populations
- **Telemedicine**: Remote monitoring of sleep quality
- **Wearable Integration**: Implementation in consumer health devices
- **Clinical Decision Support**: Automated alert systems for healthcare providers

## Discussion

### Model Interpretability
The hybrid architecture combines the temporal pattern recognition capabilities of convolutional layers with the robust classification performance of dense networks. Feature visualization revealed that the model focuses on:
- Cardiac rhythm irregularities during apneic events
- Heart rate recovery patterns post-apnea
- Baseline heart rate variability characteristics

### Limitations and Future Work
- **Dataset Size**: Expansion to larger, more diverse patient populations
- **Real-time Implementation**: Optimization for embedded systems
- **Multi-class Classification**: Severity grading (mild, moderate, severe OSA)
- **Longitudinal Studies**: Long-term monitoring effectiveness validation

## Conclusion

Our hybrid DCNN model demonstrates significant potential for automated OSA detection using ECG signals, achieving high accuracy while maintaining clinical interpretability. The approach offers a promising pathway toward accessible, cost-effective sleep disorder screening, particularly valuable in resource-limited healthcare settings.

## Acknowledgments

The authors thank the contributors to the Physionet database and acknowledge the computational resources provided by the university's high-performance computing facility.

## Clinical Trial Information

This study was conducted in accordance with the Declaration of Helsinki and approved by the institutional review board. Patient data was anonymized and handled in compliance with HIPAA regulations.

## References

1. Srivastava, K., et al. (2022). "Advanced Signal Processing Techniques for Biomedical Applications"
2. Kargeti, N. (2023). "Deep Learning Approaches in Sleep Medicine"
3. Smith, J. (2022). "ECG-based Sleep Disorder Detection: A Comprehensive Review"
4. Johnson, A. (2023). "Machine Learning in Cardiovascular Health Monitoring"