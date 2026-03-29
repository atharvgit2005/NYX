'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Lightbulb, Loader2, ArrowRight, Send, Bot, User, Sparkles, Trash2, Save, Rocket } from 'lucide-react';
import NyxButton from './ui/NyxButton';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export default function ScriptEditor() {
    const [script, setScript] = useState<string>('');
    const [ideaTitle, setIdeaTitle] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Chat state
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLTextAreaElement>(null);

    // Typewriter state
    const [isTyping, setIsTyping] = useState(false);
    const typewriterRef = useRef<NodeJS.Timeout | null>(null);

    // Load script from localStorage on mount
    useEffect(() => {
        const savedScript = localStorage.getItem('current_video_script');
        const savedIdea = localStorage.getItem('current_script_idea');

        if (savedScript) {
            setScript(savedScript);
        } else {
            setScript(
`Stop working hard. Start working smart. Here is the unfair advantage you need in 2024.

Most people think AI is just ChatGPT. But the real pros are using tools that automate the entire workflow. Imagine having a clone that does the work for you while you sleep.

Comment "AI" below and I'll send you the full list of tools I use.`
            );
        }

        if (savedIdea) {
            setIdeaTitle(savedIdea);
        }

        // Load chat history
        const savedChat = localStorage.getItem('script_chat_history');
        if (savedChat) {
            try {
                setChatMessages(JSON.parse(savedChat));
            } catch (e) { }
        } else {
            // Welcome message
            setChatMessages([{
                id: 'welcome',
                role: 'assistant',
                content: "Hey! I'm your script assistant. Ask me anything — improve your hook, rewrite a section, adjust tone, or get feedback on your script. Just type below!",
                timestamp: Date.now(),
            }]);
        }
    }, []);

    // Auto-save script to localStorage on changes
    useEffect(() => {
        if (script) {
            localStorage.setItem('current_video_script', script);
        }
    }, [script]);

    // Save chat history
    useEffect(() => {
        if (chatMessages.length > 0) {
            localStorage.setItem('script_chat_history', JSON.stringify(chatMessages));
        }
    }, [chatMessages]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, chatLoading]);

    // Cleanup typewriter on unmount
    useEffect(() => {
        return () => {
            if (typewriterRef.current) clearInterval(typewriterRef.current);
        };
    }, []);

    const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (isTyping) return; // Block manual edits during typewriter
        setScript(e.target.value);
        setHasUnsavedChanges(true);
    };

    /** Extract script content from AI response using [SCRIPT_START]/[SCRIPT_END] markers */
    const parseScriptFromResponse = (text: string): { explanation: string; scriptContent: string | null } => {
        const startMarker = '[SCRIPT_START]';
        const endMarker = '[SCRIPT_END]';
        const startIdx = text.indexOf(startMarker);
        const endIdx = text.indexOf(endMarker);

        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const scriptContent = text.slice(startIdx + startMarker.length, endIdx).trim();
            const explanation = (text.slice(0, startIdx) + text.slice(endIdx + endMarker.length)).trim();
            return { explanation, scriptContent };
        }

        return { explanation: text, scriptContent: null };
    };

    /** Typewriter effect: writes script char-by-char into the editor */
    const typewriteScript = (newScript: string) => {
        // Cancel any previous typewriter
        if (typewriterRef.current) clearInterval(typewriterRef.current);

        setIsTyping(true);
        setScript(''); // Clear editor first

        let charIndex = 0;
        const speed = 18; // ms per character

        typewriterRef.current = setInterval(() => {
            charIndex++;
            setScript(newScript.slice(0, charIndex));

            if (charIndex >= newScript.length) {
                if (typewriterRef.current) clearInterval(typewriterRef.current);
                typewriterRef.current = null;
                setIsTyping(false);
                setHasUnsavedChanges(true);
            }
        }, speed);
    };

    const handleSendMessage = async () => {
        const message = chatInput.trim();
        if (!message || chatLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: Date.now(),
        };

        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setChatLoading(true);

        try {
            // Send only last 6 messages as context to avoid token overflow
            const recentHistory = chatMessages.slice(-6).map(m => ({
                role: m.role,
                content: m.content,
            }));

            const response = await fetch('/api/scripts/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    script,
                    chatHistory: recentHistory,
                }),
            });

            const data = await response.json();
            const rawResponse = data.success ? data.data : (data.error || 'Something went wrong. Please try again.');

            // Parse for script markers
            const { explanation, scriptContent } = parseScriptFromResponse(rawResponse);

            // Build the chat message (show explanation only, not the raw script block)
            const displayContent = scriptContent
                ? (explanation || 'Here\'s your updated script!') + '\n\n✨ Script applied to editor'
                : rawResponse;

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: displayContent,
                timestamp: Date.now(),
            };

            setChatMessages(prev => [...prev, aiMsg]);

            // If script content was found, typewrite it into the editor
            if (scriptContent) {
                typewriteScript(scriptContent);
            }
        } catch (err) {
            const errMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Network error. Please check your connection and try again.',
                timestamp: Date.now(),
            };
            setChatMessages(prev => [...prev, errMsg]);
        } finally {
            setChatLoading(false);
            chatInputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        const welcomeMsg: ChatMessage = {
            id: 'welcome',
            role: 'assistant',
            content: "Chat cleared! I'm ready to help with your script. What would you like to improve?",
            timestamp: Date.now(),
        };
        setChatMessages([welcomeMsg]);
        localStorage.removeItem('script_chat_history');
    };

    const handleRegenerate = async () => {
        setGenerating(true);
        setError(null);

        let tone = 'Professional';
        const savedSocials = localStorage.getItem('connected_socials');
        if (savedSocials) {
            try {
                const socials = JSON.parse(savedSocials);
                const platforms = ['instagram', 'youtube', 'tiktok'];
                for (const platform of platforms) {
                    const user = socials[platform];
                    if (!user) continue;
                    const cached = localStorage.getItem(`brand_analysis_results_${platform}_${user}`);
                    if (cached) {
                        const parsed = JSON.parse(cached);
                        tone = parsed.tone || 'Professional';
                        break;
                    }
                }
            } catch (e) { }
        }

        try {
            const response = await fetch('/api/scripts/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idea: {
                        title: ideaTitle || 'Video Script',
                        hook: 'Generate a compelling hook',
                        angle: 'Educational',
                    },
                    tone,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setScript(data.data);
                setHasUnsavedChanges(false);
            } else {
                setError(data.error || 'Failed to regenerate script');
            }
        } catch (error) {
            console.error('Script generation failed:', error);
            setError('Network error during generation');
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        try {
            localStorage.setItem('current_video_script', script);
            setShowToast(true);
            setHasUnsavedChanges(false);
            setTimeout(() => {
                setShowToast(false);
                window.location.href = '/dashboard/video';
            }, 1500);
        } catch (e) {
            console.error(e);
        }
    };

    // Quick suggestion chips
    const quickPrompts = [
        "Make the hook more viral",
        "Shorten this script",
        "Add a stronger CTA",
        "Make it more casual",
    ];

    return (
        <div className="max-w-6xl mx-auto relative">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-24 right-8 bg-green-500 text-theme-primary px-6 py-3 rounded-xl shadow-2xl flex items-center animate-fade-in z-50">
                    <span className="mr-2">✅</span> Script Saved! Redirecting...
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-theme-primary tracking-tight">Script Editor</h2>
                    <p className="text-theme-secondary mt-2 text-lg">
                        Refine your masterpiece before production.
                    </p>
                </div>
                <div className="flex space-x-4 w-full md:w-auto">
                    <NyxButton
                        onClick={handleRegenerate}
                        variant="outline"
                        showIconContainer={false}
                        className="py-2.5 flex-1 md:flex-none"
                    >
                        {generating ? 'REGENERATING...' : 'REGENERATE AI'}
                    </NyxButton>
                    <NyxButton
                        onClick={handleSave}
                        className="py-2.5 flex-1 md:flex-none"
                    >
                        SAVE & CREATE VIDEO
                    </NyxButton>
                </div>
            </div>

            {/* Idea Context Banner */}
            {ideaTitle ? (
                <div className="mb-8 p-4 rounded-2xl bg-card-theme border border-theme flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-zinc-600 dark:text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-theme-primary">
                                Script for: {ideaTitle}
                            </p>
                            <p className="text-xs text-theme-secondary">
                                Generated from Idea Generator · {hasUnsavedChanges ? 'Unsaved changes' : 'Auto-saved'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/ideas"
                        className="text-xs font-bold text-white hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1"
                    >
                        Back to Ideas <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            ) : (
                <div className="mb-8 p-4 rounded-2xl bg-card-theme border border-theme flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-card-hover flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-theme-secondary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-theme-primary">Standalone Script</p>
                            <p className="text-xs text-theme-secondary">
                                No linked idea. Generate ideas first for personalized scripts.
                            </p>
                        </div>
                    </div>
                    <NyxButton
                        href="/dashboard/ideas"
                        className="py-1.5 px-4 text-xs"
                    >
                        GENERATE IDEAS
                    </NyxButton>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-8 text-red-200 flex items-center justify-center animate-fade-in">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Script Editor Panel */}
                <div className="lg:col-span-2">
                    <div className="bg-card-theme rounded-3xl border border-theme overflow-hidden shadow-2xl h-[600px] flex flex-col focus-within:border-orange-500/50 transition-colors">
                        <div className="bg-page px-6 py-4 border-b border-theme flex justify-between items-center backdrop-blur-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            </div>
                            {isTyping ? (
                                <span className="text-xs font-mono text-white uppercase tracking-wider flex items-center gap-2 animate-pulse">
                                    <Sparkles className="w-3 h-3" /> AI Writing...
                                </span>
                            ) : (
                                <span className="text-xs font-mono text-theme-secondary uppercase tracking-wider">Editor Mode</span>
                            )}
                        </div>
                        <div className="relative flex-1 min-h-0">
                            <textarea
                                value={script}
                                onChange={handleScriptChange}
                                readOnly={isTyping}
                                className={`w-full h-full bg-transparent p-8 text-lg md:text-xl text-theme-primary placeholder-zinc-400 dark:placeholder-zinc-700 focus:outline-none resize-none font-serif leading-loose selection:bg-zinc-500/20 ${isTyping ? 'cursor-default' : ''}`}
                                placeholder="Start writing your script..."
                                spellCheck="false"
                            />
                            {isTyping && (
                                <span className="absolute animate-blink text-white text-2xl font-light" style={{ left: 'auto', bottom: '1rem', right: '2rem' }}>▎</span>
                            )}
                        </div>
                        <div className="px-6 py-3 bg-page border-t border-theme text-xs text-theme-secondary flex justify-between">
                            <span>{script.split(/\s+/).filter(Boolean).length} words</span>
                            <span>~{Math.ceil(script.split(/\s+/).filter(Boolean).length / 3)} sec</span>
                        </div>
                    </div>
                </div>

                {/* AI Chat Panel */}
                <div className="h-[600px] flex flex-col bg-card-theme rounded-3xl border border-theme overflow-hidden shadow-2xl">
                    {/* Chat Header */}
                    <div className="px-5 py-4 border-b border-theme flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-zinc-950 dark:text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-theme-primary">Script AI</p>
                                <p className="text-[10px] text-theme-secondary">Your creative co-pilot</p>
                            </div>
                        </div>
                        <button
                            onClick={clearChat}
                            className="p-2 rounded-lg hover:bg-card-hover text-theme-secondary hover:text-theme-primary transition-colors"
                            title="Clear chat"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
                        {chatMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                                    msg.role === 'user'
                                        ? 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10'
                                        : 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10'
                                }`}>
                                    {msg.role === 'user'
                                        ? <User className="w-3.5 h-3.5 text-zinc-600 dark:text-white" />
                                        : <Bot className="w-3.5 h-3.5 text-zinc-600 dark:text-white" />
                                    }
                                </div>
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-zinc-100 dark:bg-zinc-800 text-theme-primary border border-zinc-200 dark:border-white/5 rounded-tr-sm'
                                        : 'bg-zinc-50 dark:bg-card-hover border border-theme rounded-tl-sm text-theme-primary'
                                }`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {chatLoading && (
                            <div className="flex gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="bg-card-hover border border-theme px-4 py-3 rounded-2xl rounded-tl-sm">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-white animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-white animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Prompts */}
                    {chatMessages.length <= 2 && (
                        <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-theme/50">
                            {quickPrompts.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setChatInput(prompt);
                                        chatInputRef.current?.focus();
                                    }}
                                    className="px-3 py-1.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 rounded-full text-xs text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Chat Input */}
                    <div className="px-4 py-3 border-t border-theme bg-page">
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={chatInputRef}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask AI to improve your script..."
                                rows={1}
                                className="flex-1 bg-zinc-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-theme-primary placeholder-zinc-700 focus:outline-none focus:border-white/40 resize-none max-h-24 leading-relaxed transition-colors"
                                style={{ minHeight: '44px' }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!chatInput.trim() || chatLoading}
                                className="p-3 bg-zinc-950 dark:bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 dark:hover:bg-black transition-all rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
