'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import Image from 'next/image';

export default function ProfileCard() {
    const { data: session } = useSession();

    if (!session?.user) return null;

    return (
        <div className="bg-card-theme p-8 rounded-3xl border border-theme flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4 rounded-full border-2 border-purple-500 p-1 relative overflow-hidden">
                {session.user.image ? (
                    <Image
                        src={session.user.image}
                        alt="Profile"
                        fill
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-card-hover rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-theme-secondary" />
                    </div>
                )}
            </div>

            <h3 className="text-xl font-bold text-theme-primary mb-1">{session.user.name || 'User'}</h3>
            <p className="text-theme-secondary text-sm mb-6">{session.user.email}</p>

            <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 px-6 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
            >
                <LogOut className="w-4 h-4" />
                Sign Out
            </button>
        </div>
    );
}
