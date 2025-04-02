'use client';

import VoiceRecorder from '../components/voice/VoiceRecorder';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <main>
        <h1 className="text-3xl font-bold mb-8 text-center">
          AI Voice Assistant
        </h1>
        
        <div className="max-w-md mx-auto">
          <VoiceRecorder />
        </div>
        
        <p className="text-center mt-8 text-gray-600">
          Speak to interact with the assistant
        </p>
      </main>
    </div>
  );
}