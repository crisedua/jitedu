import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase-simple';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and subscribe to auth changes
        if (supabase) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setUser(session?.user ?? null);
                setLoading(false);
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            });

            return () => subscription.unsubscribe();
        } else {
            setLoading(false);
        }
    }, []);

    // Login with Email/Password
    const signIn = async (email, password) => {
        if (!supabase) throw new Error("Supabase no está configurado");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    };

    // Register with Email/Password + Name
    const signUp = async (name, email, password) => {
        if (!supabase) throw new Error("Supabase no está configurado");

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (error) throw error;
        return data;
    };

    const logout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setUser(null);
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        logout,
        isAdmin: user?.email === 'ed@eduardoescalante.com'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
