import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database.types";
import { User } from "@supabase/supabase-js";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            // Profile doesn't exist, create one
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                email: user.email || "",
                full_name: user.email || "",
                role: "doctor", // default role
              })
              .select()
              .single();

            if (insertError) {
              throw insertError;
            }
            setProfile(newProfile);
          } else {
            throw fetchError;
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch profile"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const updateProfile = async (
    updates: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>
  ) => {
    if (!user || !profile) {
      throw new Error("No user or profile available");
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return data;
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  const isAdmin = profile?.role === "admin";
  const isDoctor = profile?.role === "doctor";
  const isNurse = profile?.role === "nurse";
  const isStaff = profile?.role === "staff";

  return {
    profile,
    loading,
    error,
    updateProfile,
    isAdmin,
    isDoctor,
    isNurse,
    isStaff,
    role: profile?.role || "doctor",
  };
}
