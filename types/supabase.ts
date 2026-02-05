export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            whitelist_participants: {
                Row: {
                    created_at: string | null
                    id: string
                    ip_address: string | null
                    protected_data_address: string
                    referral_code: string
                    referred_by: string | null
                    status: string | null
                    user_agent: string | null
                    wallet_address: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    ip_address?: string | null
                    protected_data_address: string
                    referral_code: string
                    referred_by?: string | null
                    status?: string | null
                    user_agent?: string | null
                    wallet_address: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    ip_address?: string | null
                    protected_data_address?: string
                    referral_code?: string
                    referred_by?: string | null
                    status?: string | null
                    user_agent?: string | null
                    wallet_address?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Helper types
export type WhitelistParticipant = Database['public']['Tables']['whitelist_participants']['Row']
export type WhitelistInsert = Database['public']['Tables']['whitelist_participants']['Insert']
