import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, getAdminProfile, logOut, type AdminUser } from '../services/authService';

interface AuthContextType {
    user: User | null;
    adminProfile: AdminUser | null;
    isAdmin: boolean;
    isLoading: boolean;
    signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    const profile = await getAdminProfile(firebaseUser.uid);
                    setAdminProfile(profile);
                } catch {
                    setAdminProfile(null);
                }
            } else {
                setAdminProfile(null);
            }

            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    const signOutUser = async () => {
        await logOut();
        setUser(null);
        setAdminProfile(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                adminProfile,
                isAdmin: adminProfile?.role === 'admin',
                isLoading,
                signOutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
