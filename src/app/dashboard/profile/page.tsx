import UserProfile3D from '@/components/UserProfile3D';

export default function ProfilePage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Your Profile</h2>
                <p className="text-gray-400 mt-2">Manage your account and view your stats in 3D.</p>
            </div>

            <UserProfile3D />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">Subscription</h3>
                    <div className="flex items-center justify-between p-4 bg-purple-900/20 rounded-xl border border-purple-500/20 mb-4">
                        <div>
                            <p className="text-sm text-purple-300 font-bold">PRO PLAN</p>
                            <p className="text-xs text-purple-400/60">Active until Dec 2025</p>
                        </div>
                        <button className="px-4 py-2 bg-purple-600 rounded-lg text-xs font-bold text-white">Manage</button>
                    </div>
                </div>

                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">API Usage</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Video Generation</span>
                                <span>85%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Voice Cloning</span>
                                <span>40%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
