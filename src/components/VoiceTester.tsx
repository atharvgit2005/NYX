
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Volume2, Loader2, RefreshCw } from 'lucide-react';

interface Voice {
    id: string;
    name: string;
    gender: string;
    language: string;
    isCustom?: boolean;
    previewUrl?: string;
}

export default function VoiceTester() {
    const [voices, setVoices] = useState<Voice[]>([]);
    const [loadingVoices, setLoadingVoices] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [text, setText] = useState('Hello, this is a test of the Inworld Voice API.');
    const [synthesizing, setSynthesizing] = useState(false);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Moved useEffect down to ensure fetchVoices is defined


    const fetchVoices = async () => {
        setLoadingVoices(true);
        setError(null);
        try {
            const response = await axios.get('/api/tts/voices');
            if (response.data.voices) {
                setVoices(response.data.voices);
                if (response.data.voices && response.data.voices.length > 0 && !selectedVoice) {
                    setSelectedVoice(response.data.voices[0].id);
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch voices', err);
            setError('Failed to fetch voices. Please ensure INWORLD_API_KEY is set in .env');
        } finally {
            setLoadingVoices(false);
        }
    };

    useEffect(() => {
        fetchVoices();
    }, []);

    const handleSynthesize = async () => {
        if (!selectedVoice || !text) return;

        setSynthesizing(true);
        setAudioSrc(null);
        setError(null);

        try {
            const response = await axios.post('/api/tts/synthesize', {
                text,
                voiceId: selectedVoice,
                modelId: 'inworld-tts-1.5-max',
            });

            if (response.data.audioContent) {
                const audioUrl = `data:audio/wav;base64,${response.data.audioContent}`;
                setAudioSrc(audioUrl);
            }
        } catch (err: any) {
            console.error('Failed to synthesize speech', err);
            setError('Failed to synthesize speech. Check console for details.');
        } finally {
            setSynthesizing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-card-theme rounded-2xl border border-theme">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600">
                    Inworld Voice Tester
                </h2>
                <button
                    onClick={fetchVoices}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-theme-secondary"
                    title="Refresh Voices"
                >
                    <RefreshCw className={`w-5 h-5 ${loadingVoices ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-theme-secondary">Select Voice</label>
                        <div className="relative">
                            <select
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-black/30 border border-theme rounded-xl px-4 py-3 text-theme-primary appearance-none focus:outline-none focus:ring-2 focus:ring-purple-600/50"
                                disabled={loadingVoices}
                            >
                                {voices.length === 0 && <option>Loading voices...</option>}
                                {voices.map((voice) => (
                                    <option key={voice.id} value={voice.id}>
                                        {voice.name} ({voice.gender}, {voice.language}) {voice.isCustom ? '- CLONED' : ''}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-theme-secondary">
                                ▼
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-theme-secondary">Text to Speak</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={5}
                            className="w-full bg-gray-100 dark:bg-black/30 border border-theme rounded-xl p-4 text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-600/50 resize-none"
                            placeholder="Enter text here..."
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSynthesize}
                            disabled={synthesizing || !selectedVoice || !text}
                            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-purple-500/25"
                        >
                            {synthesizing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Volume2 className="w-5 h-5" />
                                    Generate Audio
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-black/30 rounded-2xl border border-theme/50 min-h-[300px]">
                    {audioSrc ? (
                        <div className="flex flex-col items-center gap-6 w-full animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
                                <Volume2 className="w-10 h-10 text-white" />
                            </div>
                            <audio controls src={audioSrc} className="w-full" autoPlay />
                            <div className="text-center space-y-1">
                                <p className="text-theme-primary font-medium">Audio Generated!</p>
                                <p className="text-theme-secondary text-sm">Voice: {voices.find(v => v.id === selectedVoice)?.name || selectedVoice}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-3 text-theme-secondary/50">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center">
                                <Play className="w-8 h-8 ml-1 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p>Select a voice and enter text to generate audio</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
