import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { WhitelistParticipant } from '@/types/supabase'

async function getSupabaseClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )
}

async function getStats() {
    const supabase = await getSupabaseClient()

    // Get total count
    const { count: totalCount } = await supabase
        .from('whitelist_participants')
        .select('*', { count: 'exact', head: true })

    // Get last 24h count
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)

    const { count: last24h } = await supabase
        .from('whitelist_participants')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString())

    // Get latest 10 signups
    const { data: latest } = await supabase
        .from('whitelist_participants')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

    return {
        totalCount: totalCount || 0,
        last24h: last24h || 0,
        latest: (latest as WhitelistParticipant[]) || []
    }
}

export default async function AdminDashboard() {
    const supabase = await getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/admin/login')
    }

    const { totalCount, last24h, latest } = await getStats()

    return (
        <div className="min-h-screen bg-black text-white p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Quintes Dashboard</h1>
                    <p className="text-gray-400 mt-1">Whitelist Analytics</p>
                </div>
                <form action="/api/auth/signout" method="POST">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                    >
                        Sign Out
                    </button>
                </form>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Users */}
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 border border-zinc-700">
                    <p className="text-gray-400 text-sm mb-2">Total Registrations</p>
                    <p className="text-4xl font-bold text-amber-400">{totalCount}</p>
                </div>

                {/* Last 24h */}
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 border border-zinc-700">
                    <p className="text-gray-400 text-sm mb-2">Last 24 Hours</p>
                    <p className="text-4xl font-bold text-green-400">{last24h}</p>
                </div>

                {/* Conversion Rate Placeholder */}
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 border border-zinc-700">
                    <p className="text-gray-400 text-sm mb-2">Active Rate</p>
                    <p className="text-4xl font-bold text-blue-400">100%</p>
                </div>
            </div>

            {/* Latest Signups Table */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-semibold">Latest Registrations</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-800/50">
                            <tr>
                                <th className="text-left p-4 text-gray-400 font-medium text-sm">Wallet</th>
                                <th className="text-left p-4 text-gray-400 font-medium text-sm">Protected Data</th>
                                <th className="text-left p-4 text-gray-400 font-medium text-sm">Referral Code</th>
                                <th className="text-left p-4 text-gray-400 font-medium text-sm">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {latest.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        No registrations yet. They will appear here once users join the whitelist.
                                    </td>
                                </tr>
                            ) : (
                                latest.map((participant) => (
                                    <tr key={participant.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                                        <td className="p-4 font-mono text-sm">
                                            {participant.wallet_address.slice(0, 6)}...{participant.wallet_address.slice(-4)}
                                        </td>
                                        <td className="p-4 font-mono text-sm text-amber-400">
                                            {participant.protected_data_address.slice(0, 6)}...{participant.protected_data_address.slice(-4)}
                                        </td>
                                        <td className="p-4 font-mono text-sm text-gray-400">
                                            {participant.referral_code}
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">
                                            {participant.created_at
                                                ? new Date(participant.created_at).toLocaleDateString()
                                                : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
