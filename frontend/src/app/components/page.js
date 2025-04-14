'use client';
import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Heading, Paragraph } from '../../components/Typography';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Link from '../../components/Link';
import Chip from '../../components/Chip';
import Input from '../../components/Input';
import InputContainer from '../../components/InputContainer';
import Toggle from '../../components/Toggle';
import DynamicBackground from '../../components/DynamicBackground';

// Memoize components to prevent unnecessary re-renders
const MemoizedButton = memo(Button);
const MemoizedChip = memo(Chip);

export default function ComponentsShowcase() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [toggleValue, setToggleValue] = useState(false);
  const [chips] = useState(['Chip', 'Primary', 'Success', 'Warning', 'Error']);
  
  const [inputValue, setInputValue] = useState('');

  // Use stable callback
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);
  
  const handleToggleChange = useCallback((value) => {
    setToggleValue(value);
  }, []);

  const Section = ({ title, children }) => (
    <div className="mb-16">
      <Heading level={2} className="text-xl mb-6">{title}</Heading>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <DynamicBackground isDarkMode={isDarkMode} />
      
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <Heading level={1} className="text-3xl">Component Library</Heading>
          <Toggle 
            checked={isDarkMode} 
            onChange={toggleTheme} 
            label={isDarkMode ? 'Dark Mode' : 'Light Mode'} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Section title="Buttons">
              <div className="flex gap-4">
                <MemoizedButton>Primary Button</MemoizedButton>
                <MemoizedButton className="bg-opacity-40">Primary Hover</MemoizedButton>
              </div>
            </Section>
            
            <Section title="Links">
              <div className="space-y-2">
                <div><Link href="/components">Internal Link</Link></div>
                <div><Link href="https://nextjs.org" external>External Link</Link></div>
              </div>
            </Section>
            
            <Section title="Chips">
              <div className="flex flex-wrap gap-2 mb-4">
                <MemoizedChip>Chip</MemoizedChip>
                <MemoizedChip color="primary">Primary</MemoizedChip>
                <MemoizedChip color="success">Success</MemoizedChip>
                <MemoizedChip color="warning">Warning</MemoizedChip>
                <MemoizedChip color="error">Error</MemoizedChip>
              </div>
              <div className="flex flex-wrap gap-2">
                <MemoizedChip className="bg-opacity-30">Chip Hover</MemoizedChip>
                <MemoizedChip color="primary" className="bg-opacity-30">Primary</MemoizedChip>
                <MemoizedChip color="success" className="bg-opacity-30">Success</MemoizedChip>
                <MemoizedChip color="warning" className="bg-opacity-30">Warning</MemoizedChip>
                <MemoizedChip color="error" className="bg-opacity-30">Error</MemoizedChip>
              </div>
            </Section>
            
            <Section title="Inputs">
  <InputContainer placeholder="Type Input Here" />
</Section>
          </div>
          
          <div>
          <Card 
  title="Heading" 
  subtitle="Move your cursor to see the effect"
  hoverEffect={true}
>
  Lorem ipsum dolor sit amet consectetur. Lectus tellus integer nunc ultricies proin faucibus tortor porttitor. Sit suspendisse adipiscing quis in hendrerit nunc nunc aenean. Diam gravida amet urna posuere. Adipiscing tristique pellentesque posuere amet orci tempor eu sed metus.
</Card>
            
          </div>
        </div>
      </div>
    </div>
  );
}