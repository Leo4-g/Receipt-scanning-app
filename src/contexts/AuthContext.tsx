import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as SupabaseUser,
  Session,
  AuthError
} from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<{ success: boolean, message: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setCurrentUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to fetch user profile
  async function fetchUserProfile(user: SupabaseUser) {
    try {
      setLoading(true);
      
      // First check if profile exists
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log("Profile doesn't exist, creating new profile for:", user.id);
          await createProfile(user);
        } else {
          console.error("Error fetching profile:", error);
        }
      } else if (profile) {
        // Profile exists, set current user
        setCurrentUser({
          id: user.id,
          email: user.email!,
          ...profile
        });
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createProfile(user: SupabaseUser): Promise<User | null> {
    try {
      console.log("Creating profile for user:", user.id);
      
      const newProfile = {
        id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error("Error creating profile:", error);
        return null;
      }

      const userWithProfile = {
        id: user.id,
        email: user.email!,
        ...data
      };
      
      setCurrentUser(userWithProfile);
      return userWithProfile;
    } catch (error) {
      console.error("Error in createProfile:", error);
      return null;
    }
  }

  async function signup(email: string, password: string) {
    try {
      console.log("Signing up with email:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) throw error;
      
      if (!data.user) {
        throw new Error('No user data returned');
      }

      // Immediately create profile after signup
      await createProfile(data.user);
      
      return {
        success: true,
        message: "Account created! Please check your email for verification link"
      };
    } catch (error: any) {
      console.error('Error in signup:', error);
      return {
        success: false,
        message: error.message || 'Failed to create account'
      };
    }
  }

  async function login(email: string, password: string) {
    try {
      console.log("Logging in with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('No user returned from login');
      }

      // Fetch or create profile
      await fetchUserProfile(data.user);
      
    } catch (error: any) {
      console.error('Error in login:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
    } catch (error: any) {
      console.error('Error in logout:', error);
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error: any) {
      console.error('Error in resetPassword:', error);
      throw error;
    }
  }

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
