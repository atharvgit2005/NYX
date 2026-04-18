import prisma from '@/lib/prismadb';
import { BookOpen, Mail, User, MessageCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InquiriesPage() {
    const contacts = await prisma.contact.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-theme-primary flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-orange-500" /> Web Inquiries
                </h1>
                <p className="text-theme-secondary mt-1">
                    {contacts.length} comprehensive contacts · {leads.length} lead emails
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Full Contacts Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-theme-primary flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-purple-400" /> Full Contact Forms
                    </h2>
                    
                    {contacts.length === 0 ? (
                        <div className="text-center py-12 border border-theme rounded-2xl bg-card-theme">
                            <MessageCircle className="w-8 h-8 mx-auto mb-3 opacity-30 text-theme-secondary" />
                            <p className="text-theme-secondary">No complete contacts yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {contacts.map((contact) => (
                                <div key={contact.id} className="p-5 rounded-2xl border border-theme bg-card-theme hover:border-orange-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                                                {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                                            </div>
                                            <div>
                                                <p className="text-theme-primary font-bold">{contact.name}</p>
                                                <p className="text-xs text-theme-secondary flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {contact.email}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                            {contact.objective}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-page rounded-xl border border-theme/50">
                                        <p className="text-sm text-theme-secondary whitespace-pre-wrap leading-relaxed">{contact.message}</p>
                                    </div>
                                    <p className="text-[10px] text-theme-secondary mt-3 text-right">
                                        {new Date(contact.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Direct Leads Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-theme-primary flex items-center gap-2">
                        <User className="w-5 h-5 text-green-400" /> Direct Leads (Emails)
                    </h2>
                    
                    {leads.length === 0 ? (
                        <div className="text-center py-12 border border-theme rounded-2xl bg-card-theme">
                            <Mail className="w-8 h-8 mx-auto mb-3 opacity-30 text-theme-secondary" />
                            <p className="text-theme-secondary">No email leads yet</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-theme overflow-hidden bg-card-theme">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-theme">
                                        <th className="text-left px-5 py-3 text-xs font-bold text-theme-secondary uppercase tracking-wider">Email Address</th>
                                        <th className="text-right px-5 py-3 text-xs font-bold text-theme-secondary uppercase tracking-wider">Date Captured</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.map(lead => (
                                        <tr key={lead.id} className="border-b border-theme last:border-b-0 hover:bg-page transition-colors">
                                            <td className="px-5 py-4 text-sm font-medium text-theme-primary flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-orange-400" /> {lead.email}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-theme-secondary text-right">
                                                {new Date(lead.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
