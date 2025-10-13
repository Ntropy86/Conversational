'use client';
import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import Card from './Card';
import Input from './Input';
import { typographyClasses } from './Typography';

// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const Guestbook = () => {
  const [showCanvas, setShowCanvas] = useState(false);
  const [signatures, setSignatures] = useState([]);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedColor, setSelectedColor] = useState('#8B7355'); // Golden brown default
  const canvasRef = useRef(null);
  const loaderRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Color palette - elegant, no black/dark colors
  const colors = [
    { name: 'Golden Brown', value: '#8B7355' },
    { name: 'Copper', value: '#B87333' },
    { name: 'Orange', value: '#E67E22' },
    { name: 'Purple', value: '#9B59B6' },
    { name: 'Blue', value: '#3498DB' },
    { name: 'Teal', value: '#1ABC9C' },
  ];

  // Quick emoji picks
  const quickEmojis = ['✨', '🎨', '💫', '🌟', '🔥', '💜', '🎭', '🌈', '⚡', '🎪', '🎯', '🎸', '🚀', '💎', '🌺', '🎵'];

  useEffect(() => {
    loadSignatures();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreSignatures();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, offset]);

  const loadSignatures = async () => {
    try {
      setLoading(true);
      // Fetch first batch from backend database API
      const response = await fetch(`${API_URL}/api/guestbook?limit=20&offset=0`);
      if (response.ok) {
        const data = await response.json();
        setSignatures(data.signatures || []);
        setOffset(20);
        setHasMore(data.signatures.length === 20); // If we got less than 20, no more to load
        console.log('✅ Loaded initial signatures from database:', data.signatures.length);
      } else {
        console.error('Failed to load signatures:', response.status);
      }
    } catch (error) {
      console.error('Error loading signatures from database:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreSignatures = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const response = await fetch(`${API_URL}/api/guestbook?limit=20&offset=${offset}`);
      if (response.ok) {
        const data = await response.json();
        if (data.signatures && data.signatures.length > 0) {
          setSignatures(prev => [...prev, ...data.signatures]);
          setOffset(prev => prev + data.signatures.length);
          setHasMore(data.signatures.length === 20);
          console.log(`✅ Loaded ${data.signatures.length} more signatures (total: ${signatures.length + data.signatures.length})`);
        } else {
          setHasMore(false);
          console.log('✅ No more signatures to load');
        }
      }
    } catch (error) {
      console.error('Error loading more signatures:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const getCanvasCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    // Calculate the scaling factor between display size and canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Get coordinates relative to the canvas and scale them
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    return { x, y };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoordinates(e, canvas);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsMouseDown(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isMouseDown) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoordinates(e, canvas);
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (e) e.preventDefault();
    setIsMouseDown(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !name.trim()) {
      alert('Please enter your name!');
      return;
    }

    setLoading(true);
    const imageData = canvas.toDataURL('image/png');
    
    const signatureData = {
      name: name.trim(),
      emoji: emoji.trim() || quickEmojis[Math.floor(Math.random() * quickEmojis.length)], // Random if not selected
      image: imageData
    };

    try {
      // Save to backend database API
      const response = await fetch(`${API_URL}/api/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signatureData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Signature saved to database:', data);
        // Reload signatures from database
        await loadSignatures();
      } else {
        const errorText = await response.text();
        console.error('Failed to save signature:', response.status, errorText);
        alert('Failed to save signature. Please try again.');
      }
    } catch (error) {
      console.error('Error saving signature to database:', error);
      alert('Error saving signature. Please check your connection.');
    }

    setLoading(false);
    setShowCanvas(false);
    setName('');
    setEmoji('');
    clearCanvas();
  };

  return (
    <section id="guestbook" className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-3xl md:text-4xl ${typographyClasses.heading}`}
          >
            ✍️ Guestbook
          </motion.h2>
          <p className={`${typographyClasses.body} max-w-2xl mx-auto`}>
            Leave your mark! Draw something creative and sign the wall.
          </p>
          
          <Button
            onClick={() => setShowCanvas(true)}
            className="mx-auto"
          >
            Sign the Guestbook
          </Button>
        </div>

        {/* Drawing Canvas Modal */}
        <AnimatePresence>
          {showCanvas && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCanvas(false)}
            >
              <Card 
                className="max-w-lg w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className={`text-2xl ${typographyClasses.heading} mb-4`}>
                  Create Your Signature
                </h3>
                
                {/* Name Input */}
                <Input
                  type="text"
                  placeholder="Your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mb-4"
                  maxLength={30}
                />

                {/* Emoji Picker */}
                <div className="mb-4">
                  <p className={`text-sm ${typographyClasses.subtitle} mb-2`}>
                    Pick an emoji (or leave for random!):
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {quickEmojis.map((em) => (
                      <button
                        key={em}
                        onClick={() => setEmoji(em)}
                        className={`text-2xl p-2 rounded-lg transition-all hover:scale-110 ${
                          emoji === em 
                            ? 'bg-gray-200 dark:bg-gray-700 scale-110' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        title={em}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Picker */}
                <div className="mb-4">
                  <p className={`text-sm ${typographyClasses.subtitle} mb-2`}>Choose your color:</p>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color.value 
                            ? 'border-gray-900 dark:border-white scale-110' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Canvas */}
                <div className="relative mb-4">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg cursor-crosshair"
                    style={{ 
                      background: 'rgba(139, 115, 85, 0.08)',
                      backdropFilter: 'blur(10px)',
                      touchAction: 'none'  // Prevent scrolling while drawing, but allow touch events
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  <p className={`text-xs ${typographyClasses.subtitle} mt-2`}>
                    Draw or write something creative!
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={clearCanvas}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCanvas(false);
                      clearCanvas();
                      setName('');
                      setEmoji('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveSignature}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Signatures Wall - Metro UI Style */}
        <div className="space-y-6 mt-12">
          <h3 className={`text-xl md:text-2xl ${typographyClasses.heading} text-center`}>
            Signature Wall ({signatures.length})
          </h3>
          
          {signatures.length === 0 ? (
            <Card className="text-center py-12">
              <p className={typographyClasses.body}>
                No signatures yet. Be the first to sign!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {signatures.map((sig, index) => (
                <motion.div
                  key={sig.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05
                  }}
                >
                  <Card className="overflow-visible relative">
                    {/* Emoji Badge - More frosted and grainy */}
                    <div 
                      className="absolute -top-3 -right-3 z-10 w-12 h-12 rounded-full flex items-center justify-center transform -rotate-12"
                      style={{
                        background: 'rgba(139, 115, 85, 0.25)',
                        backdropFilter: 'blur(16px) saturate(180%)',
                        border: '1px solid rgba(139, 115, 85, 0.3)',
                        filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <span className="text-2xl">{sig.emoji || '✨'}</span>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Signature Image - Single enclosure */}
                      <div className="rounded-lg p-4 h-32 flex items-center justify-center">
                        <img
                          src={sig.image}
                          alt={`Signature by ${sig.name}`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      
                      {/* Name and Date */}
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${typographyClasses.heading}`}>
                          {sig.name}
                        </span>
                        <span className={`text-xs ${typographyClasses.subtitle}`}>
                          {new Date(sig.timestamp).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Infinite Scroll Loader */}
          {!loading && hasMore && (
            <div 
              ref={loaderRef}
              className="flex justify-center items-center py-8"
            >
              {loadingMore ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                <div className="h-8"></div>
              )}
            </div>
          )}
          
          {!loading && !hasMore && signatures.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                ✨ You've reached the end!
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default memo(Guestbook);
