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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          added_by: string | null
          created_at: string
          email: string
          id: string
          is_owner: boolean
          name: string | null
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          email: string
          id?: string
          is_owner?: boolean
          name?: string | null
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          email?: string
          id?: string
          is_owner?: boolean
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          contact_email: string | null
          created_at: string
          email_scope: Database["public"]["Enums"]["email_scope"]
          emailed_at: string | null
          event_id: string
          id: string
          institution: string | null
          issued_on: string
          name_norm: string
          pdf_path: string
          pdf_sha256: string
          place: number | null
          public_id: string
          recipient_name: string
          status: Database["public"]["Enums"]["certificate_status"]
          team_name: string | null
          type: Database["public"]["Enums"]["certificate_type"]
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          email_scope?: Database["public"]["Enums"]["email_scope"]
          emailed_at?: string | null
          event_id: string
          id?: string
          institution?: string | null
          issued_on: string
          name_norm: string
          pdf_path: string
          pdf_sha256: string
          place?: number | null
          public_id: string
          recipient_name: string
          status?: Database["public"]["Enums"]["certificate_status"]
          team_name?: string | null
          type: Database["public"]["Enums"]["certificate_type"]
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          email_scope?: Database["public"]["Enums"]["email_scope"]
          emailed_at?: string | null
          event_id?: string
          id?: string
          institution?: string | null
          issued_on?: string
          name_norm?: string
          pdf_path?: string
          pdf_sha256?: string
          place?: number | null
          public_id?: string
          recipient_name?: string
          status?: Database["public"]["Enums"]["certificate_status"]
          team_name?: string | null
          type?: Database["public"]["Enums"]["certificate_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          date_label: string | null
          description: string | null
          id: string
          is_published: boolean
          recap_url: string | null
          registration_url: string | null
          series: string | null
          slug: string
          starts_on: string | null
          status: Database["public"]["Enums"]["event_status"]
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          date_label?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          recap_url?: string | null
          registration_url?: string | null
          series?: string | null
          slug: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          date_label?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          recap_url?: string | null
          registration_url?: string | null
          series?: string | null
          slug?: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          caption: string | null
          created_at: string
          event_id: string | null
          height: number | null
          id: string
          image_url: string
          is_published: boolean
          sort_order: number
          taken_on: string | null
          updated_at: string
          width: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          event_id?: string | null
          height?: number | null
          id?: string
          image_url: string
          is_published?: boolean
          sort_order?: number
          taken_on?: string | null
          updated_at?: string
          width?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          event_id?: string | null
          height?: number | null
          id?: string
          image_url?: string
          is_published?: boolean
          sort_order?: number
          taken_on?: string | null
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          about: string | null
          consent_at: string | null
          created_at: string
          currently_building: string | null
          degree: string | null
          division: Database["public"]["Enums"]["member_division"]
          email: string | null
          full_name: string
          fun_fact: string | null
          github_url: string | null
          id: string
          instagram_url: string | null
          is_published: boolean
          joined_year: number | null
          level: Database["public"]["Enums"]["member_level"]
          linkedin_url: string | null
          photo_url: string | null
          portfolio_url: string | null
          role_title: string | null
          slug: string
          sort_order: number
          tags: string[]
          updated_at: string
          year_of_study: string | null
        }
        Insert: {
          about?: string | null
          consent_at?: string | null
          created_at?: string
          currently_building?: string | null
          degree?: string | null
          division?: Database["public"]["Enums"]["member_division"]
          email?: string | null
          full_name: string
          fun_fact?: string | null
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          is_published?: boolean
          joined_year?: number | null
          level?: Database["public"]["Enums"]["member_level"]
          linkedin_url?: string | null
          photo_url?: string | null
          portfolio_url?: string | null
          role_title?: string | null
          slug: string
          sort_order?: number
          tags?: string[]
          updated_at?: string
          year_of_study?: string | null
        }
        Update: {
          about?: string | null
          consent_at?: string | null
          created_at?: string
          currently_building?: string | null
          degree?: string | null
          division?: Database["public"]["Enums"]["member_division"]
          email?: string | null
          full_name?: string
          fun_fact?: string | null
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          is_published?: boolean
          joined_year?: number | null
          level?: Database["public"]["Enums"]["member_level"]
          linkedin_url?: string | null
          photo_url?: string | null
          portfolio_url?: string | null
          role_title?: string | null
          slug?: string
          sort_order?: number
          tags?: string[]
          updated_at?: string
          year_of_study?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          logo_url: string | null
          name: string
          relationship: string | null
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name: string
          relationship?: string | null
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name?: string
          relationship?: string | null
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          hits: number
          key: string
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          hits: number
          key: string
          updated_at?: string
          window_start: string
        }
        Update: {
          created_at?: string
          hits?: number
          key?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          source?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hit_rate_limit: {
        Args: { p_key: string; p_max_hits: number; p_window_seconds: number }
        Returns: boolean
      }
    }
    Enums: {
      certificate_status: "issued" | "revoked"
      certificate_type:
        | "participation"
        | "winner"
        | "runner_up"
        | "merit"
        | "volunteer"
        | "organiser"
      email_scope: "team" | "individual"
      event_status:
        | "upcoming"
        | "registration_open"
        | "coming_soon"
        | "completed"
      member_division:
        | "projects"
        | "webdev"
        | "teaching"
        | "media"
        | "operations"
        | "marketing"
        | "alumni"
        | "none"
      member_level: "faculty" | "board" | "head" | "lead" | "core" | "member"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      certificate_status: ["issued", "revoked"],
      certificate_type: [
        "participation",
        "winner",
        "runner_up",
        "merit",
        "volunteer",
        "organiser",
      ],
      email_scope: ["team", "individual"],
      event_status: [
        "upcoming",
        "registration_open",
        "coming_soon",
        "completed",
      ],
      member_division: [
        "projects",
        "webdev",
        "teaching",
        "media",
        "operations",
        "marketing",
        "alumni",
        "none",
      ],
      member_level: ["faculty", "board", "head", "lead", "core", "member"],
    },
  },
} as const
