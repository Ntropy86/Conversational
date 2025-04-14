'use client';
import React, { createContext, useState, useContext } from 'react';

// Create context
const AIAgentContext = createContext();

// Sample project data for UI testing - based on the resume context
const sampleProjects = [
  {
    title: "Chicago Crimes Forecasting & Hotspot Analysis",
    date: "Feb 2025",
    technologies: ["ARIMA", "LSTM", "DBSCAN", "PySpark", "AWS EMR", "Plotly"],
    description: "Engineered a hybrid ARIMA-LSTM predictive model that improved crime pattern forecasting accuracy to 85%, enabling law-enforcement to optimize patrol resource allocation and reduce response times. Deployed spatial clustering using DBSCAN to identify crime hotspots across 12 crime categories totaling 10M reports."
  },
  {
    title: "EEG Emotion Classifier",
    date: "Jan 2023",
    technologies: ["ExtraTrees", "SMOTE", "PyTorch", "Signal Processing"],
    description: "Achieved 91% accuracy in classifying emotions from EEG signals using advanced feature extraction and ensemble methods with SMOTE for imbalanced data."
  }
];

export function AIAgentProvider({ children }) {
  const [isAIMode, setIsAIMode] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAIResponding, setIsAIResponding] = useState(false);
  
  // Toggle between normal and AI agent mode
  const toggleAIMode = () => {
    setIsAIMode(!isAIMode);
    // Reset conversation when switching modes
    if (!isAIMode) {
      setConversation([]);
    }
  };
  
  // Placeholder functions for voice input
  const startListening = () => {
    setIsListening(true);
  };
  
  const stopListening = () => {
    setIsListening(false);
  };
  
  // Add user message to conversation
  const addUserMessage = (message) => {
    // Check if this is the first message
    if (conversation.length === 0) {
      // Make the first message a header/title question
      const newConversation = [
        { role: 'user', content: message }
      ];
      setConversation(newConversation);
    } else {
      // Add as a regular message in the conversation
      const newConversation = [
        ...conversation,
        { role: 'user', content: message }
      ];
      setConversation(newConversation);
    }
  };
  
  // For UI testing: provide fake answers based on the resume context
  const generateAIResponse = async (userMessage) => {
    setIsAIResponding(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let responseContent = "";
    let projectsToShow = [];
    
    // Match different keywords to simulate responses
    const messageLower = userMessage.toLowerCase();
    
    if (messageLower.includes("project") || messageLower.includes("data science")) {
      responseContent = "Too many to count! He got 91% Accuracy in the EEG Classifier Using SMOTE Analysis! He has also Made a Chicago Crime Prediction Algorithm!";
      projectsToShow = sampleProjects;
    } else if (messageLower.includes("skill") || messageLower.includes("experience")) {
      responseContent = "Nitigya has a strong skillset in AI/ML with Python, PyTorch, and TensorFlow. He's worked at CDAC, Spenza, and as a researcher at UW-Madison.";
    } else if (messageLower.includes("education") || messageLower.includes("degree")) {
      responseContent = "He has a Master's in Data Science from UW–Madison with a ~3.8 GPA, and previously earned a B.Tech in CS with a 9.35 GPA.";
    } else if (messageLower.includes("hello") || messageLower.includes("hi")) {
      responseContent = "Yo, I'm in a comedic mood today. Let's do this!";
    } else if (messageLower.includes("contact") || messageLower.includes("email") || messageLower.includes("phone")) {
      responseContent = "You can reach Nitigya at kargeti@wisc.edu or +1 (608) 217-8515. He's currently based in Madison, WI.";
    } else {
      responseContent = "I'm Nitigya's AI assistant. Ask me about his projects, skills, or experience!";
    }
    
    // Add assistant response
    setConversation(prev => [
      ...prev,
      { 
        role: 'assistant', 
        content: responseContent,
        projects: projectsToShow
      }
    ]);
    
    setIsAIResponding(false);
  };
  
  return (
    <AIAgentContext.Provider value={{
      isAIMode,
      toggleAIMode,
      conversation,
      isListening,
      startListening,
      stopListening,
      transcript,
      setTranscript,
      isAIResponding,
      addUserMessage,
      generateAIResponse
    }}>
      {children}
    </AIAgentContext.Provider>
  );
}

// Custom hook for using AI agent context
export function useAIAgent() {
  return useContext(AIAgentContext);
}