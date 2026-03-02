import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Mail, Lock, User, Phone, Eye, EyeOff, ShoppingBag, ArrowRight, LogIn } from 'lucide-react';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { toast } from 'sonner';

export function CustomerLogin() {
    const { signIn, register } = useCustomerAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const [mode, setMode] = useState<'login' | 'register'>(
        searchParams.get('mode') === 'register' ? 'register' : 'login'
    );
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
        newsletter: false,
    });

    const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            toast.error('Email and password are required');
            return;
        }
        if (mode === 'register') {
            if (!form.firstName || !form.lastName) {
                toast.error('First and last name are required');
                return;
            }
            if (form.password !== form.confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }
            if (form.password.length < 6) {
                toast.error('Password must be at least 6 characters');
                return;
            }
        }

        try {
            setLoading(true);
            if (mode === 'login') {
                await signIn(form.email, form.password);

                // Redirect admins directly to the admin portal
                const { getCurrentUser, isStaffOrAdmin } = await import('../services/authService');
                const currentUser = getCurrentUser();
                if (currentUser) {
                    const hasAdminAccess = await isStaffOrAdmin(currentUser.uid);
                    if (hasAdminAccess) {
                        toast.success('Welcome back, Admin!');
                        navigate('/admin');
                        return;
                    }
                }

                toast.success('Welcome back!');
            } else {
                await register(form.email, form.password, form.firstName, form.lastName, form.phone);
                toast.success('Account created! Welcome to Seba Digital.');
            }
            navigate(redirectTo);
        } catch (err: any) {
            const msg = err.code === 'auth/user-not-found' ? 'No account found with this email'
                : err.code === 'auth/wrong-password' ? 'Incorrect password'
                    : err.code === 'auth/email-already-in-use' ? 'An account with this email already exists'
                        : err.code === 'auth/weak-password' ? 'Password is too weak'
                            : err.message || 'Something went wrong';
            toast.error(mode === 'login' ? 'Sign in failed' : 'Registration failed', { description: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
            {/* Left panel — branding */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-12 text-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-300 rounded-full blur-3xl" />
                </div>
                <div className="relative">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold">Seba Digital</span>
                    </Link>
                </div>
                <div className="relative">
                    <h2 className="text-4xl font-bold leading-tight mb-4">
                        {mode === 'login' ? 'Welcome back to\nSeba Digital' : 'Join Seba Digital\ntoday'}
                    </h2>
                    <p className="text-blue-100 text-lg mb-8">
                        {mode === 'login'
                            ? 'Sign in to track your orders, manage your account, and shop faster.'
                            : 'Create an account for faster checkout, order tracking, and exclusive deals.'}
                    </p>
                    <div className="space-y-4">
                        {[
                            { icon: '📦', label: 'Track all your orders in one place' },
                            { icon: '🏪', label: 'Book Click & Collect in-store' },
                            { icon: '🎁', label: 'Exclusive member-only deals' },
                        ].map(({ icon, label }) => (
                            <div key={label} className="flex items-center gap-3">
                                <span className="text-2xl">{icon}</span>
                                <span className="text-blue-100">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative text-blue-200 text-sm">
                    West Ealing, London · Mon–Fri 9am–6pm · Sat 9am–5pm
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Seba Digital</span>
                        </Link>
                    </div>

                    {/* Tab switcher */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
                    </h1>
                    <p className="text-gray-500 text-sm mb-6">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            {mode === 'login' ? 'Register here' : 'Sign in'}
                        </button>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Register fields */}
                        {mode === 'register' && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text" placeholder="First name" value={form.firstName}
                                            onChange={(e) => update('firstName', e.target.value)} required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text" placeholder="Last name" value={form.lastName}
                                            onChange={(e) => update('lastName', e.target.value)} required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel" placeholder="Phone number (optional)" value={form.phone}
                                        onChange={(e) => update('phone', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            </>
                        )}

                        {/* Email */}
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email" placeholder="Email address" value={form.email}
                                onChange={(e) => update('email', e.target.value)} required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password}
                                onChange={(e) => update('password', e.target.value)} required
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Confirm password (register only) */}
                        {mode === 'register' && (
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'} placeholder="Confirm password" value={form.confirmPassword}
                                    onChange={(e) => update('confirmPassword', e.target.value)} required
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${form.confirmPassword && form.password !== form.confirmPassword
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-300'
                                        }`}
                                />
                                {form.confirmPassword && form.password !== form.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                                )}
                            </div>
                        )}

                        {/* Newsletter (register only) */}
                        {mode === 'register' && (
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox" checked={form.newsletter}
                                    onChange={(e) => update('newsletter', e.target.checked)}
                                    className="mt-0.5 w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm text-gray-600">
                                    Sign me up for exclusive deals and new arrivals from Seba Digital
                                </span>
                            </label>
                        )}

                        {/* Forgot password (login only) */}
                        {mode === 'login' && (
                            <div className="text-right">
                                <Link to="/account/forgot-password" className="text-sm text-blue-600 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                        )}

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            ) : mode === 'login' ? (
                                <><LogIn className="w-4 h-4" /> Sign In</>
                            ) : (
                                <><ArrowRight className="w-4 h-4" /> Create Account</>
                            )}
                        </button>
                    </form>

                    <p className="text-xs text-gray-400 text-center mt-6">
                        By {mode === 'login' ? 'signing in' : 'creating an account'}, you agree to our{' '}
                        <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                    </p>

                    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                            ← Continue shopping without an account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
