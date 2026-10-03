/**
 * Database types.
 *
 * This file mirrors the output of
 *
 *   npm run db:types     # supabase gen types typescript --linked
 *
 * Run that command after every migration and let it overwrite this file —
 * it is written in the generator's shape so the diff stays clean. It is
 * hand-maintained only until the Supabase project is linked.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string;
          avatar_url: string | null;
          avatar_public_id: string | null;
          city: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name: string;
          avatar_url?: string | null;
          avatar_public_id?: string | null;
          city?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string;
          avatar_url?: string | null;
          avatar_public_id?: string | null;
          city?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      pets: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          species: Database["public"]["Enums"]["pet_species"];
          breed: string | null;
          birth_date: string | null;
          gender: Database["public"]["Enums"]["pet_gender"];
          bio: string | null;
          avatar_url: string | null;
          avatar_public_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          species: Database["public"]["Enums"]["pet_species"];
          breed?: string | null;
          birth_date?: string | null;
          gender?: Database["public"]["Enums"]["pet_gender"];
          bio?: string | null;
          avatar_url?: string | null;
          avatar_public_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          species?: Database["public"]["Enums"]["pet_species"];
          breed?: string | null;
          birth_date?: string | null;
          gender?: Database["public"]["Enums"]["pet_gender"];
          bio?: string | null;
          avatar_url?: string | null;
          avatar_public_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      pet_species: "dog" | "cat" | "bird" | "rabbit" | "other";
      pet_gender: "male" | "female" | "unknown";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
