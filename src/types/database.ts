export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type HouseholdRole = "owner" | "member";
export type InviteStatus = "pending" | "accepted" | "declined";
export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          week_starts_on: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      households: {
        Row: { id: string; name: string; created_by: string | null; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["households"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["households"]["Row"]>;
        Relationships: [];
      };
      household_members: {
        Row: { id: string; household_id: string; user_id: string; role: HouseholdRole; joined_at: string };
        Insert: Partial<Database["public"]["Tables"]["household_members"]["Row"]> & {
          household_id: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["household_members"]["Row"]>;
        Relationships: [];
      };
      household_invites: {
        Row: {
          id: string;
          household_id: string;
          invited_email: string;
          invited_by: string | null;
          status: InviteStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["household_invites"]["Row"]> & {
          household_id: string;
          invited_email: string;
        };
        Update: Partial<Database["public"]["Tables"]["household_invites"]["Row"]>;
        Relationships: [];
      };
      event_categories: {
        Row: { id: string; household_id: string; name: string; color: string; is_default: boolean };
        Insert: Partial<Database["public"]["Tables"]["event_categories"]["Row"]> & {
          household_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_categories"]["Row"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          household_id: string;
          title: string;
          description: string | null;
          start_at: string;
          end_at: string | null;
          all_day: boolean;
          category_id: string | null;
          is_holiday: boolean;
          recurrence_rule: string | null;
          link: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & {
          household_id: string;
          title: string;
          start_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
        Relationships: [];
      };
      event_reminders: {
        Row: { id: string; event_id: string; remind_at: string; label: string | null };
        Insert: Partial<Database["public"]["Tables"]["event_reminders"]["Row"]> & {
          event_id: string;
          remind_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_reminders"]["Row"]>;
        Relationships: [];
      };
      todos: {
        Row: {
          id: string;
          household_id: string;
          event_id: string | null;
          title: string;
          notes: string | null;
          due_at: string | null;
          completed: boolean;
          completed_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["todos"]["Row"]> & {
          household_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["todos"]["Row"]>;
        Relationships: [];
      };
      meals: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          description: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["meals"]["Row"]> & {
          household_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["meals"]["Row"]>;
        Relationships: [];
      };
      meal_ingredients: {
        Row: { id: string; meal_id: string; name: string; quantity: string | null; unit: string | null };
        Insert: Partial<Database["public"]["Tables"]["meal_ingredients"]["Row"]> & {
          meal_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["meal_ingredients"]["Row"]>;
        Relationships: [];
      };
      meal_plan_entries: {
        Row: {
          id: string;
          household_id: string;
          meal_id: string;
          planned_date: string;
          meal_slot: MealSlot;
        };
        Insert: Partial<Database["public"]["Tables"]["meal_plan_entries"]["Row"]> & {
          household_id: string;
          meal_id: string;
          planned_date: string;
          meal_slot: MealSlot;
        };
        Update: Partial<Database["public"]["Tables"]["meal_plan_entries"]["Row"]>;
        Relationships: [];
      };
      grocery_items: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          quantity: string | null;
          unit: string | null;
          checked: boolean;
          source: "meal" | "manual";
          meal_plan_entry_id: string | null;
          added_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["grocery_items"]["Row"]> & {
          household_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["grocery_items"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_pending_household_invites: { Args: Record<string, never>; Returns: Json };
      accept_household_invite: { Args: { target_invite_id: string }; Returns: Json };
      decline_household_invite: { Args: { target_invite_id: string }; Returns: Json };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
