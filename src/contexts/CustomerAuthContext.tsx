import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, logOut, registerCustomer, signInCustomer } from '../services/authService';
import { getCustomerById, type Customer } from '../services/customerService';

interface CustomerAuthContextType {
    user: User | null;
    customer: Customer | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setIsLoading(true);
            setUser(firebaseUser);
            if (firebaseUser) {
                try {
                    const profile = await getCustomerById(firebaseUser.uid);
                    setCustomer(profile);
                } catch {
                    setCustomer(null);
                }
            } else {
                setCustomer(null);
            }
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        const firebaseUser = await signInCustomer(email, password);
        const profile = await getCustomerById(firebaseUser.uid);
        setCustomer(profile);
    };

    const register = async (email: string, password: string, firstName: string, lastName: string, phone = '') => {
        const firebaseUser = await registerCustomer(email, password, firstName, lastName, phone);
        const profile = await getCustomerById(firebaseUser.uid);
        setCustomer(profile);
    };

    const signOut = async () => {
        await logOut();
        setUser(null);
        setCustomer(null);
    };

    return (
        <CustomerAuthContext.Provider value={{ user, customer, isLoading, signIn, register, signOut }}>
            {children}
        </CustomerAuthContext.Provider>
    );
}

export function useCustomerAuth() {
    const ctx = useContext(CustomerAuthContext);
    if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
    return ctx;
}
