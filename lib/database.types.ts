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
      broadcast: {
        Row: {
          contact_tags: string[] | null
          created_at: string
          delivered_count: number
          failed_count: number
          id: string
          language: string
          name: string
          processed_count: number
          read_count: number
          replied_count: number
          scheduled_count: number | null
          sent_count: number
          template_name: string
        }
        Insert: {
          contact_tags?: string[] | null
          created_at?: string
          delivered_count?: number
          failed_count?: number
          id?: string
          language: string
          name: string
          processed_count?: number
          read_count?: number
          replied_count?: number
          scheduled_count?: number | null
          sent_count?: number
          template_name: string
        }
        Update: {
          contact_tags?: string[] | null
          created_at?: string
          delivered_count?: number
          failed_count?: number
          id?: string
          language?: string
          name?: string
          processed_count?: number
          read_count?: number
          replied_count?: number
          scheduled_count?: number | null
          sent_count?: number
          template_name?: string
        }
        Relationships: []
      }
      broadcast_batch: {
        Row: {
          broadcast_id: string
          created_at: string
          ended_at: string | null
          id: string
          scheduled_count: number
          sent_count: number
          started_at: string | null
          status: string | null
        }
        Insert: {
          broadcast_id: string
          created_at?: string
          ended_at?: string | null
          id: string
          scheduled_count: number
          sent_count?: number
          started_at?: string | null
          status?: string | null
        }
        Update: {
          broadcast_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          scheduled_count?: number
          sent_count?: number
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      broadcast_contact: {
        Row: {
          batch_id: string
          broadcast_id: string
          contact_id: number
          created_at: string
          delivered_at: string | null
          failed_at: string | null
          id: string
          processed_at: string | null
          read_at: string | null
          replied_at: string | null
          reply_counted: boolean
          sent_at: string | null
          wam_id: string | null
        }
        Insert: {
          batch_id: string
          broadcast_id: string
          contact_id: number
          created_at?: string
          delivered_at?: string | null
          failed_at?: string | null
          id?: string
          processed_at?: string | null
          read_at?: string | null
          replied_at?: string | null
          reply_counted?: boolean
          sent_at?: string | null
          wam_id?: string | null
        }
        Update: {
          batch_id?: string
          broadcast_id?: string
          contact_id?: number
          created_at?: string
          delivered_at?: string | null
          failed_at?: string | null
          id?: string
          processed_at?: string | null
          read_at?: string | null
          replied_at?: string | null
          reply_counted?: boolean
          sent_at?: string | null
          wam_id?: string | null
        }
        Relationships: []
      }
      contact_tag: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          profile_name: string | null
          tags: string[] | null
          wa_id: number
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          profile_name?: string | null
          tags?: string[] | null
          wa_id: number
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          profile_name?: string | null
          tags?: string[] | null
          wa_id?: number
        }
        Relationships: []
      }
      contacts_last_messages: {
        Row: {
          in_chat: boolean
          last_message_at: string | null
          last_message_received_at: string | null
          unread_count: number | null
          wa_id: number
          zone_id: number
        }
        Insert: {
          in_chat?: boolean
          last_message_at?: string | null
          last_message_received_at?: string | null
          unread_count?: number | null
          wa_id: number
          zone_id: number
        }
        Update: {
          in_chat?: boolean
          last_message_at?: string | null
          last_message_received_at?: string | null
          unread_count?: number | null
          wa_id?: number
          zone_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "contacts_last_messages_wa_id_fkey"
            columns: ["wa_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["wa_id"]
          },
          {
            foreignKeyName: "contacts_last_messages_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "hotel_zones"
            referencedColumns: ["zone_id"]
          },
        ]
      }
      hotel_zones: {
        Row: {
          whatsapp_account_id: string | null
          whatsapp_number_id: string | null
          zone_id: number
          zone_name: string | null
        }
        Insert: {
          whatsapp_account_id?: string | null
          whatsapp_number_id?: string | null
          zone_id: number
          zone_name?: string | null
        }
        Update: {
          whatsapp_account_id?: string | null
          whatsapp_number_id?: string | null
          zone_id?: number
          zone_name?: string | null
        }
        Relationships: []
      }
      hotels: {
        Row: {
          hotel_id: number
          hotel_name: string | null
          hotel_zone: number | null
          template_preventivo_name: string | null
        }
        Insert: {
          hotel_id: number
          hotel_name?: string | null
          hotel_zone?: number | null
          template_preventivo_name?: string | null
        }
        Update: {
          hotel_id?: number
          hotel_name?: string | null
          hotel_zone?: number | null
          template_preventivo_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotels_hotel_zone_fkey"
            columns: ["hotel_zone"]
            isOneToOne: false
            referencedRelation: "hotel_zones"
            referencedColumns: ["zone_id"]
          },
        ]
      }
      message_template: {
        Row: {
          category: string
          components: Json
          created_at: string
          id: string
          language: string
          name: string
          previous_category: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          category: string
          components: Json
          created_at?: string
          id: string
          language: string
          name: string
          previous_category?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          components?: Json
          created_at?: string
          id?: string
          language?: string
          name?: string
          previous_category?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: number
          created_at: string
          delivered_at: string | null
          failed_at: string | null
          hotel_zone: number | null
          id: number
          is_received: boolean
          media_url: string | null
          message: Json
          read_at: string | null
          read_by_user_at: string | null
          sent_at: string | null
          wam_id: string
        }
        Insert: {
          chat_id: number
          created_at?: string
          delivered_at?: string | null
          failed_at?: string | null
          hotel_zone?: number | null
          id?: number
          is_received?: boolean
          media_url?: string | null
          message: Json
          read_at?: string | null
          read_by_user_at?: string | null
          sent_at?: string | null
          wam_id: string
        }
        Update: {
          chat_id?: number
          created_at?: string
          delivered_at?: string | null
          failed_at?: string | null
          hotel_zone?: number | null
          id?: number
          is_received?: boolean
          media_url?: string | null
          message?: Json
          read_at?: string | null
          read_by_user_at?: string | null
          sent_at?: string | null
          wam_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_hotel_zone_fkey"
            columns: ["hotel_zone"]
            isOneToOne: false
            referencedRelation: "hotel_zones"
            referencedColumns: ["zone_id"]
          },
        ]
      }
      profiles: {
        Row: {
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          last_updated: string | null
        }
        Insert: {
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          last_updated?: string | null
        }
        Update: {
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_updated?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      setup: {
        Row: {
          created_at: string | null
          display_text: string
          done_at: string | null
          id: string
          in_progress: boolean
          name: string | null
          sequence: number | null
        }
        Insert: {
          created_at?: string | null
          display_text: string
          done_at?: string | null
          id?: string
          in_progress?: boolean
          name?: string | null
          sequence?: number | null
        }
        Update: {
          created_at?: string | null
          display_text?: string
          done_at?: string | null
          id?: string
          in_progress?: boolean
          name?: string | null
          sequence?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook: {
        Row: {
          created_at: string | null
          id: number
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: number
          payload?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_delivered_count_to_broadcast: {
        Args: {
          b_id: string
          delivered_count_to_be_added: number
        }
        Returns: undefined
      }
      add_failed_count_to_broadcast: {
        Args: {
          b_id: string
          failed_count_to_be_added: number
        }
        Returns: undefined
      }
      add_processed_count_to_broadcast: {
        Args: {
          b_id: string
          processed_count_to_be_added: number
        }
        Returns: undefined
      }
      add_read_count_to_broadcast: {
        Args: {
          b_id: string
          read_count_to_be_added: number
        }
        Returns: undefined
      }
      add_replied_to_broadcast_contact: {
        Args: {
          b_id: string
          replied_count_to_be_added: number
        }
        Returns: undefined
      }
      add_sent_count_to_broadcast: {
        Args: {
          b_id: string
          sent_count_to_be_added: number
        }
        Returns: undefined
      }
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"]
        }
        Returns: boolean
      }
      custom_access_token_hook: {
        Args: {
          event: Json
        }
        Returns: Json
      }
      pick_next_broadcast_batch: {
        Args: {
          b_id: string
        }
        Returns: string
      }
      update_message_delivered_status: {
        Args: {
          delivered_at_in: string
          wam_id_in: string
        }
        Returns: boolean
      }
      update_message_failed_status: {
        Args: {
          wam_id_in: string
          failed_at_in: string
        }
        Returns: boolean
      }
      update_message_read_status: {
        Args: {
          wam_id_in: string
          read_at_in: string
        }
        Returns: boolean
      }
      update_message_sent_status: {
        Args: {
          wam_id_in: string
          sent_at_in: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_permission:
        | "contact.read"
        | "contact.write"
        | "chat.read"
        | "chat.write"
      app_role: "admin" | "agent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
