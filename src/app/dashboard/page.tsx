export default function Dashboard() {
    return (
        <div>
            <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
            <p className="mt-4 text-gray-400">Welcome to your AI Content Automation Engine.</p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Stats placeholders */}
                {['Total Videos', 'Pending Ideas', 'Avg. Engagement'].map((stat) => (
                    <div key={stat} className="bg-white/5 overflow-hidden shadow rounded-lg border border-white/10">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-400 truncate">{stat}</dt>
                            <dd className="mt-1 text-3xl font-semibold text-white">0</dd>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
