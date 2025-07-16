export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_companies: {
        Row: {
          address: string | null
          code: string
          created_at: string
          email: string | null
          id: string
          license_number: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          email?: string | null
          id?: string
          license_number?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          license_number?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      agent_staff: {
        Row: {
          agent_company_id: string | null
          created_at: string
          id: string
          position: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_company_id?: string | null
          created_at?: string
          id?: string
          position: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_company_id?: string | null
          created_at?: string
          id?: string
          position?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_staff_agent_company_id_fkey"
            columns: ["agent_company_id"]
            isOneToOne: false
            referencedRelation: "agent_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_branches: {
        Row: {
          address: string
          bank_id: string | null
          city: string
          created_at: string
          id: string
          name: string
          phone: string | null
          province: string
          updated_at: string
        }
        Insert: {
          address: string
          bank_id?: string | null
          city: string
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          province: string
          updated_at?: string
        }
        Update: {
          address?: string
          bank_id?: string | null
          city?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          province?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_branches_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_products: {
        Row: {
          bank_id: string | null
          created_at: string
          id: string
          interest_rate: number
          max_amount: number
          max_tenor: number
          min_amount: number
          min_tenor: number
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          bank_id?: string | null
          created_at?: string
          id?: string
          interest_rate: number
          max_amount: number
          max_tenor: number
          min_amount: number
          min_tenor: number
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          bank_id?: string | null
          created_at?: string
          id?: string
          interest_rate?: number
          max_amount?: number
          max_tenor?: number
          min_amount?: number
          min_tenor?: number
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_products_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_reviews: {
        Row: {
          branch_application_id: string | null
          comments: string | null
          created_at: string
          id: string
          reviewed_at: string
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          branch_application_id?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          reviewed_at?: string
          reviewed_by?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          branch_application_id?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          reviewed_at?: string
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_reviews_branch_application_id_fkey"
            columns: ["branch_application_id"]
            isOneToOne: false
            referencedRelation: "branch_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "bank_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_staff: {
        Row: {
          bank_id: string | null
          branch_id: string | null
          created_at: string
          id: string
          position: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bank_id?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          position: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bank_id?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          position?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_staff_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_staff_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "bank_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      banks: {
        Row: {
          code: string
          created_at: string
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      branch_applications: {
        Row: {
          assigned_at: string
          bank_product_id: string | null
          branch_id: string | null
          created_at: string
          id: string
          loan_application_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          bank_product_id?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          loan_application_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          bank_product_id?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          loan_application_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_applications_bank_product_id_fkey"
            columns: ["bank_product_id"]
            isOneToOne: false
            referencedRelation: "bank_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_applications_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "bank_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_applications_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          coverage_amount: number | null
          created_at: string | null
          id: string
          insurance_company_id: string | null
          loan_application_id: string | null
          policy_document_url: string | null
          policy_number: string | null
          premium_amount: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          coverage_amount?: number | null
          created_at?: string | null
          id?: string
          insurance_company_id?: string | null
          loan_application_id?: string | null
          policy_document_url?: string | null
          policy_number?: string | null
          premium_amount?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          coverage_amount?: number | null
          created_at?: string | null
          id?: string
          insurance_company_id?: string | null
          loan_application_id?: string | null
          policy_document_url?: string | null
          policy_number?: string | null
          premium_amount?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_assignments_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_assignments_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_companies: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          email: string | null
          id: string
          license_number: string | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          email?: string | null
          id?: string
          license_number?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          email?: string | null
          id?: string
          license_number?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      insurance_staff: {
        Row: {
          created_at: string | null
          id: string
          insurance_company_id: string | null
          position: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          insurance_company_id?: string | null
          position?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          insurance_company_id?: string | null
          position?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_staff_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_applications: {
        Row: {
          address_domicile: string | null
          address_ktp: string | null
          age: number | null
          alamat_pasangan: string | null
          alamat_pemberi_kerja: string | null
          assigned_agent_id: string | null
          bank_approved_at: string | null
          birth_date: string | null
          birth_place: string | null
          bunga_bank: number | null
          created_at: string
          dokumen_kartu_keluarga_url: string | null
          dokumen_ktp_keluarga_penjamin_url: string | null
          dokumen_lain_1_url: string | null
          dokumen_lain_2_url: string | null
          dokumen_paspor_url: string | null
          dokumen_perjanjian_kerja_url: string | null
          dokumen_perjanjian_penempatan_pmi_url: string | null
          dokumen_persetujuan_data_privacy_url: string | null
          dokumen_standing_instruction_url: string | null
          dokumen_surat_nikah_url: string | null
          email: string | null
          full_name: string
          gender: string | null
          grace_period: number | null
          id: string
          info_slik_bank_url: string | null
          institution: string | null
          ktp_pasangan: string | null
          ktp_photo_url: string | null
          last_education: string | null
          loan_amount: number | null
          major: string | null
          nama_ibu_kandung: string | null
          nama_pasangan: string | null
          nama_pemberi_kerja: string | null
          negara_penempatan: string | null
          nik_ktp: string | null
          nomor_sisko: string | null
          other_certifications: string | null
          pas_foto_3x4_url: string | null
          phone_number: string | null
          self_photo_url: string | null
          status: string
          submission_type: string | null
          surat_izin_ortu_wali_url: string | null
          surat_keterangan_p3mi_url: string | null
          surat_permohonan_kredit_url: string | null
          surat_pernyataan_ortu_wali_url: string | null
          tanggal_keberangkatan: string | null
          telp_pasangan: string | null
          telp_pemberi_kerja: string | null
          tenor_months: number | null
          updated_at: string
          user_id: string | null
          validated_by_lendana: string | null
          validated_by_lendana_at: string | null
          work_experience: string | null
          work_location: string | null
        }
        Insert: {
          address_domicile?: string | null
          address_ktp?: string | null
          age?: number | null
          alamat_pasangan?: string | null
          alamat_pemberi_kerja?: string | null
          assigned_agent_id?: string | null
          bank_approved_at?: string | null
          birth_date?: string | null
          birth_place?: string | null
          bunga_bank?: number | null
          created_at?: string
          dokumen_kartu_keluarga_url?: string | null
          dokumen_ktp_keluarga_penjamin_url?: string | null
          dokumen_lain_1_url?: string | null
          dokumen_lain_2_url?: string | null
          dokumen_paspor_url?: string | null
          dokumen_perjanjian_kerja_url?: string | null
          dokumen_perjanjian_penempatan_pmi_url?: string | null
          dokumen_persetujuan_data_privacy_url?: string | null
          dokumen_standing_instruction_url?: string | null
          dokumen_surat_nikah_url?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          grace_period?: number | null
          id?: string
          info_slik_bank_url?: string | null
          institution?: string | null
          ktp_pasangan?: string | null
          ktp_photo_url?: string | null
          last_education?: string | null
          loan_amount?: number | null
          major?: string | null
          nama_ibu_kandung?: string | null
          nama_pasangan?: string | null
          nama_pemberi_kerja?: string | null
          negara_penempatan?: string | null
          nik_ktp?: string | null
          nomor_sisko?: string | null
          other_certifications?: string | null
          pas_foto_3x4_url?: string | null
          phone_number?: string | null
          self_photo_url?: string | null
          status?: string
          submission_type?: string | null
          surat_izin_ortu_wali_url?: string | null
          surat_keterangan_p3mi_url?: string | null
          surat_permohonan_kredit_url?: string | null
          surat_pernyataan_ortu_wali_url?: string | null
          tanggal_keberangkatan?: string | null
          telp_pasangan?: string | null
          telp_pemberi_kerja?: string | null
          tenor_months?: number | null
          updated_at?: string
          user_id?: string | null
          validated_by_lendana?: string | null
          validated_by_lendana_at?: string | null
          work_experience?: string | null
          work_location?: string | null
        }
        Update: {
          address_domicile?: string | null
          address_ktp?: string | null
          age?: number | null
          alamat_pasangan?: string | null
          alamat_pemberi_kerja?: string | null
          assigned_agent_id?: string | null
          bank_approved_at?: string | null
          birth_date?: string | null
          birth_place?: string | null
          bunga_bank?: number | null
          created_at?: string
          dokumen_kartu_keluarga_url?: string | null
          dokumen_ktp_keluarga_penjamin_url?: string | null
          dokumen_lain_1_url?: string | null
          dokumen_lain_2_url?: string | null
          dokumen_paspor_url?: string | null
          dokumen_perjanjian_kerja_url?: string | null
          dokumen_perjanjian_penempatan_pmi_url?: string | null
          dokumen_persetujuan_data_privacy_url?: string | null
          dokumen_standing_instruction_url?: string | null
          dokumen_surat_nikah_url?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          grace_period?: number | null
          id?: string
          info_slik_bank_url?: string | null
          institution?: string | null
          ktp_pasangan?: string | null
          ktp_photo_url?: string | null
          last_education?: string | null
          loan_amount?: number | null
          major?: string | null
          nama_ibu_kandung?: string | null
          nama_pasangan?: string | null
          nama_pemberi_kerja?: string | null
          negara_penempatan?: string | null
          nik_ktp?: string | null
          nomor_sisko?: string | null
          other_certifications?: string | null
          pas_foto_3x4_url?: string | null
          phone_number?: string | null
          self_photo_url?: string | null
          status?: string
          submission_type?: string | null
          surat_izin_ortu_wali_url?: string | null
          surat_keterangan_p3mi_url?: string | null
          surat_permohonan_kredit_url?: string | null
          surat_pernyataan_ortu_wali_url?: string | null
          tanggal_keberangkatan?: string | null
          telp_pasangan?: string | null
          telp_pemberi_kerja?: string | null
          tenor_months?: number | null
          updated_at?: string
          user_id?: string | null
          validated_by_lendana?: string | null
          validated_by_lendana_at?: string | null
          work_experience?: string | null
          work_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_applications_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agent_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_applications_validated_by_lendana_fkey"
            columns: ["validated_by_lendana"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
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
