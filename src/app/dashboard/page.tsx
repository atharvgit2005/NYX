'use client';

import { useEffect, useState } from 'react';
import VideoHistoryList from '@/components/VideoHistoryList';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalVideos: 0,
        pendingIdeas: 0, // Placeholder
        engagement: 'N/A' // Placeholder
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setStats(data.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
            <p className="mt-4 text-gray-400">Welcome to your AI Content Automation Engine.</p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white/5 overflow-hidden shadow rounded-lg border border-white/10">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-400 truncate">Total Videos</dt>
                        <dd className="mt-1 text-3xl font-semibold text-white">
                            {loading ? '...' : stats.totalVideos}
                        </dd>
                    </div>
                </div>
                <div className="bg-white/5 overflow-hidden shadow rounded-lg border border-white/10">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-400 truncate">Pending Ideas</dt>
                        <dd className="mt-1 text-3xl font-semibold text-white">
                            {loading ? '...' : stats.pendingIdeas}
                        </dd>
                    </div>
                </div>
                <div className="bg-white/5 overflow-hidden shadow rounded-lg border border-white/10">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-400 truncate">Avg. Engagement</dt>
                        <dd className="mt-1 text-3xl font-semibold text-white">
                            {loading ? '...' : stats.engagement}
                        </dd>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold text-white mb-6">Video History</h2>
                <VideoHistoryList />
            </div>
        </div>
    );
}
