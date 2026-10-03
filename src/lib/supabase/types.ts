/**
 * Database types.
 *
 * GENERATED FILE — do not edit by hand. Regenerate after every migration:
 *
 *   npm run db:types
 *
 * The schema is still empty at this point (Phase 0 is scaffolding only); the
 * shape below is exactly what `supabase gen types typescript` emits for an
 * empty public schema, so swapping it out later is a clean overwrite.
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
    Tables: { [_ in never]: never };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
