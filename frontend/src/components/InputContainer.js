// InputContainer.js - New file to create
'use client';
import { useState, useCallback, memo } from 'react';
import Input from './Input';

const InputContainer = memo(({ placeholder }) => {
  const [value, setValue] = useState('');
  
  const handleChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
    />
  );
});

InputContainer.displayName = 'InputContainer';

export default InputContainer;