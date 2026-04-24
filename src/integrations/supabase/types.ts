export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      dupart_products: {
        Row: {
          cost: number
          created_at: string
          id: string
          name: string
          price: number
          stock: number
          user_id: string
        }
        Insert: {
          cost?: number
          created_at?: string
          id?: string
          name: string
          price?: number
          stock?: number
          user_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          name?: string
          price?: number
          stock?: number
          user_id?: string
        }
        Relationships: []
      }
      dupart_sales: {
        Row: {
          cash: number
          change: number
          created_at: string
          id: string
          items: Json
          total: number
          user_id: string
        }
        Insert: {
          cash?: number
          change?: number
          created_at?: string
          id?: string
          items?: Json
          total?: number
          user_id: string
        }
        Update: {
          cash?: number
          change?: number
          created_at?: string
          id?: string
          items?: Json
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      express_bookings: {
        Row: {
          client: string
          created_at: string
          date: string
          id: string
          notes: string | null
          rate: number
          type: string
          user_id: string
        }
        Insert: {
          client: string
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          rate?: number
          type: string
          user_id: string
        }
        Update: {
          client?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          rate?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      express_clients: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      express_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          date: string
          description: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      express_maintenance: {
        Row: {
          created_at: string
          id: string
          label: string
          msg: string | null
          note: string | null
          sort_order: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          msg?: string | null
          note?: string | null
          sort_order?: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          msg?: string | null
          note?: string | null
          sort_order?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      express_trips: {
        Row: {
          created_at: string
          date: string
          earnings: number
          fuel: number
          id: string
          notes: string | null
          route: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          earnings?: number
          fuel?: number
          id?: string
          notes?: string | null
          route: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          earnings?: number
          fuel?: number
          id?: string
          notes?: string | null
          route?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      ghetto_materials: {
        Row: {
          created_at: string
          id: string
          name: string
          reorder: number
          stock: number
          unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          reorder?: number
          stock?: number
          unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          reorder?: number
          stock?: number
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ghetto_orders: {
        Row: {
          client: string
          created_at: string
          date: string
          dp: number
          id: string
          item: string
          notes: string | null
          price: number
          qty: number
          size: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          client: string
          created_at?: string
          date: string
          dp?: number
          id?: string
          item: string
          notes?: string | null
          price?: number
          qty?: number
          size?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          client?: string
          created_at?: string
          date?: string
          dp?: number
          id?: string
          item?: string
          notes?: string | null
          price?: number
          qty?: number
          size?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_name: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
