
import React from 'react';
import VoiceTester from '@/components/VoiceTester';

export default function TestVoicePage() {
    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex flex-col items-center text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-600 mb-2">
                        Voice Generation
                    </h1>
                    <p className="text-gray-400 max-w-lg mx-auto text-lg leading-relaxed">
                        Test and experiment with different AI voice models powered by Inworld. Select a voice, type your text, and listen to the result.
                    </p>
                </header>

                <section className="w-full">
                    <VoiceTester />
                </section>

                <footer className="text-center text-gray-500 text-sm py-8 space-y-2">
                    <p>Powered by Inworld AI</p>
                    <div className="flex gap-4 justify-center">
                        <span className="bg-purple-900/20 px-3 py-1 rounded-full text-xs text-purple-400 font-mono border border-purple-500/20">TTS 1.5 Max</span>
                        <span className="bg-blue-900/20 px-3 py-1 rounded-full text-xs text-blue-400 font-mono border border-blue-500/20">Ultra-Low Latency</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
