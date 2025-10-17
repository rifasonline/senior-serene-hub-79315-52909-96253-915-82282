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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          completed: boolean
          created_at: string
          description: string | null
          doctor_name: string | null
          elderly_id: string
          id: string
          location: string | null
          title: string
        }
        Insert: {
          appointment_date: string
          completed?: boolean
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          elderly_id: string
          id?: string
          location?: string | null
          title: string
        }
        Update: {
          appointment_date?: string
          completed?: boolean
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          elderly_id?: string
          id?: string
          location?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_elderly_id_fkey"
            columns: ["elderly_id"]
            isOneToOne: false
            referencedRelation: "elderly_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          deadline: string | null
          description: string
          elderly_id: string
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          scheduled_time: string
          status: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          elderly_id: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          scheduled_time: string
          status?: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          title?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          elderly_id?: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          scheduled_time?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_elderly_id_fkey"
            columns: ["elderly_id"]
            isOneToOne: false
            referencedRelation: "elderly_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      elderly_profiles: {
        Row: {
          allergies: string[] | null
          birth_date: string
          caregiver_id: string
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          medical_conditions: string[] | null
          name: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          birth_date: string
          caregiver_id: string
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          medical_conditions?: string[] | null
          name: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          birth_date?: string
          caregiver_id?: string
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          medical_conditions?: string[] | null
          name?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "elderly_profiles_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_history: {
        Row: {
          attachments: string[] | null
          created_at: string
          date: string
          description: string
          doctor_name: string | null
          elderly_id: string
          entry_type: Database["public"]["Enums"]["medical_entry_type"]
          id: string
          location: string | null
          title: string
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string
          date: string
          description: string
          doctor_name?: string | null
          elderly_id: string
          entry_type: Database["public"]["Enums"]["medical_entry_type"]
          id?: string
          location?: string | null
          title: string
        }
        Update: {
          attachments?: string[] | null
          created_at?: string
          date?: string
          description?: string
          doctor_name?: string | null
          elderly_id?: string
          entry_type?: Database["public"]["Enums"]["medical_entry_type"]
          id?: string
          location?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_history_elderly_id_fkey"
            columns: ["elderly_id"]
            isOneToOne: false
            referencedRelation: "elderly_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          active: boolean
          created_at: string
          dosage: string
          elderly_id: string
          frequency: string
          id: string
          name: string
          notes: string | null
          times: string[]
        }
        Insert: {
          active?: boolean
          created_at?: string
          dosage: string
          elderly_id: string
          frequency: string
          id?: string
          name: string
          notes?: string | null
          times?: string[]
        }
        Update: {
          active?: boolean
          created_at?: string
          dosage?: string
          elderly_id?: string
          frequency?: string
          id?: string
          name?: string
          notes?: string | null
          times?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "medications_elderly_id_fkey"
            columns: ["elderly_id"]
            isOneToOne: false
            referencedRelation: "elderly_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sos_alerts: {
        Row: {
          created_at: string
          elderly_id: string
          id: string
          location: string | null
          notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["sos_status"]
          triggered_by: string
        }
        Insert: {
          created_at?: string
          elderly_id: string
          id?: string
          location?: string | null
          notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["sos_status"]
          triggered_by: string
        }
        Update: {
          created_at?: string
          elderly_id?: string
          id?: string
          location?: string | null
          notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["sos_status"]
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_alerts_elderly_id_fkey"
            columns: ["elderly_id"]
            isOneToOne: false
            referencedRelation: "elderly_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sos_alerts_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_plan: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["plan_type"]
      }
      has_active_subscription: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      medical_entry_type:
        | "exam"
        | "consultation"
        | "hospital"
        | "emergency"
        | "other"
      plan_type: "basic" | "pro"
      sos_status: "pending" | "acknowledged" | "resolved"
      subscription_status: "active" | "cancelled" | "expired"
      task_priority: "low" | "medium" | "high"
      task_status: "pending" | "in_progress" | "completed"
      task_type: "medication" | "feeding" | "hygiene" | "exercise" | "other"
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
    Enums: {
      app_role: ["admin", "user"],
      medical_entry_type: [
        "exam",
        "consultation",
        "hospital",
        "emergency",
        "other",
      ],
      plan_type: ["basic", "pro"],
      sos_status: ["pending", "acknowledged", "resolved"],
      subscription_status: ["active", "cancelled", "expired"],
      task_priority: ["low", "medium", "high"],
      task_status: ["pending", "in_progress", "completed"],
      task_type: ["medication", "feeding", "hygiene", "exercise", "other"],
    },
  },
} as const
