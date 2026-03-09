import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type AuthView = 'signin' | 'signup' | 'verify-otp' | 'forgot-password' | 'reset-password';

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<AuthView>('signin');
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpType, setOtpType] = useState<'signup' | 'recovery'>('signup');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    newPassword: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate(from, { replace: true });
      }
    };
    checkAuth();
  }, [navigate, from]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (authError) setAuthError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const clearMessages = () => {
    setAuthError(null);
    setSuccessMessage(null);
  };

  // Sign In with email/password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    if (!formData.email || !formData.password) {
      setAuthError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      
      console.log('[Auth] Sign-in attempt:', { email: formData.email.trim().toLowerCase(), hasError: !!error, errorMsg: error?.message, hasUser: !!data?.user });

      if (error) {
        console.error('Sign in error:', error);
        let errorMessage = "An error occurred during sign in.";
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes('Email not confirmed')) {
          // Send OTP for verification
          setPendingEmail(formData.email.trim().toLowerCase());
          setOtpType('signup');
          await supabase.auth.resend({
            type: 'signup',
            email: formData.email.trim().toLowerCase(),
          });
          setCurrentView('verify-otp');
          setSuccessMessage("Please verify your email. We've sent a verification code.");
          setIsLoading(false);
          return;
        } else if (error.message.includes('Too many requests')) {
          errorMessage = "Too many login attempts. Please wait a moment and try again.";
        } else {
          errorMessage = error.message;
        }
        
        setAuthError(errorMessage);
      } else if (data.user) {
        console.log('Sign in successful:', data.user.email);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up - sends OTP to email
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      setAuthError("Please fill in all fields");
      return;
    }

    if (!agreedToTerms) {
      setAuthError("Please agree to the Privacy Policy and Terms of Service to create an account");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setAuthError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      // Sign up with email - this will send OTP automatically
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
          }
        }
      });

      if (error) {
        let errorMessage = "An error occurred during sign up.";
        
        if (error.message.includes('User already registered')) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = "Password must be at least 6 characters long.";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Please enter a valid email address.";
        } else {
          errorMessage = error.message;
        }
        
        setAuthError(errorMessage);
      } else if (data.user) {
        if (data.session) {
          // Auto-confirmed (for testing environments)
          toast({
            title: "Account Created!",
            description: "Welcome to ClauseWise!",
          });
          navigate(from, { replace: true });
        } else if (data.user.identities?.length === 0) {
          // User exists but email not confirmed
          setAuthError("An account with this email already exists. Please sign in.");
          setCurrentView('signin');
        } else {
          // OTP sent for verification
          setPendingEmail(formData.email.trim().toLowerCase());
          setOtpType('signup');
          setCurrentView('verify-otp');
          setSuccessMessage(`Verification code sent to ${formData.email}. Please check your email.`);
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    clearMessages();

    if (otpValue.length !== 6) {
      setAuthError("Please enter the 6-digit verification code");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: otpValue,
        type: otpType === 'signup' ? 'signup' : 'recovery',
      });

      if (error) {
        console.error('OTP verification error:', error);
        if (error.message.includes('Token has expired')) {
          setAuthError("Verification code has expired. Please request a new one.");
        } else if (error.message.includes('Invalid')) {
          setAuthError("Invalid verification code. Please try again.");
        } else {
          setAuthError(error.message);
        }
      } else if (data.user) {
        if (otpType === 'recovery') {
          // Show reset password form
          setCurrentView('reset-password');
          setSuccessMessage("Email verified. Please set your new password.");
        } else {
          // Signup verification successful
          toast({
            title: "Email Verified!",
            description: "Your account has been created successfully.",
          });
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    clearMessages();
    setIsLoading(true);
    
    try {
      if (otpType === 'signup') {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: pendingEmail,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(pendingEmail);
        if (error) throw error;
      }
      
      setSuccessMessage("A new verification code has been sent to your email.");
      setOtpValue('');
    } catch (error: any) {
      setAuthError(error.message || "Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password - sends OTP
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!formData.email) {
      setAuthError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email.trim().toLowerCase()
      );

      if (error) {
        setAuthError(error.message);
      } else {
        setPendingEmail(formData.email.trim().toLowerCase());
        setOtpType('recovery');
        setCurrentView('verify-otp');
        setSuccessMessage(`Password reset code sent to ${formData.email}. Please check your email.`);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!formData.newPassword || formData.newPassword.length < 6) {
      setAuthError("Password must be at least 6 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) {
        setAuthError(error.message);
      } else {
        // Sign out so user can test sign-in with new password
        await supabase.auth.signOut();
        toast({
          title: "Password Reset Successful",
          description: "Please sign in with your new password.",
        });
        setFormData({ ...formData, password: '', newPassword: '', confirmPassword: '' });
        setCurrentView('signin');
      }
    } catch (error) {
      console.error('Password update error:', error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        toast({
          title: "Google Sign In Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Sign In Error",
        description: "Failed to sign in with Google",
        variant: "destructive"
      });
    }
  };

  const renderOTPView = () => (
    <div className="space-y-4">
      <button
        onClick={() => {
          setCurrentView(otpType === 'signup' ? 'signup' : 'forgot-password');
          clearMessages();
          setOtpValue('');
        }}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      {successMessage && (
        <Alert className="bg-secondary/10 border-secondary/30">
          <CheckCircle className="h-4 w-4 text-secondary" />
          <AlertDescription className="text-secondary">{successMessage}</AlertDescription>
        </Alert>
      )}

      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Enter Verification Code</h3>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-foreground">{pendingEmail}</span>
        </p>
      </div>

      <div className="flex justify-center py-4">
        <InputOTP
          value={otpValue}
          onChange={setOtpValue}
          maxLength={6}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button 
        onClick={handleVerifyOTP} 
        className="w-full" 
        disabled={isLoading || otpValue.length !== 6}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify Code'
        )}
      </Button>

      <div className="text-center">
        <button
          onClick={handleResendOTP}
          disabled={isLoading}
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          Didn't receive the code? Resend
        </button>
      </div>
    </div>
  );

  const renderForgotPasswordView = () => (
    <div className="space-y-4">
      <button
        onClick={() => {
          setCurrentView('signin');
          clearMessages();
        }}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Sign In
      </button>

      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold text-foreground">Reset Your Password</h3>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>

      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="pl-10"
            required
            autoComplete="email"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Code...
            </>
          ) : (
            'Send Reset Code'
          )}
        </Button>
      </form>
    </div>
  );

  const renderResetPasswordView = () => (
    <div className="space-y-4">
      {successMessage && (
        <Alert className="bg-secondary/10 border-secondary/30">
          <CheckCircle className="h-4 w-4 text-secondary" />
          <AlertDescription className="text-secondary">{successMessage}</AlertDescription>
        </Alert>
      )}

      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold text-foreground">Set New Password</h3>
        <p className="text-sm text-muted-foreground">
          Create a new password for your account.
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="New Password (min. 6 characters)"
            value={formData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            className="pl-10 pr-10"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="pl-10"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Password...
            </>
          ) : (
            'Set New Password'
          )}
        </Button>
      </form>
    </div>
  );

  const renderAuthTabs = () => (
    <>
      <Tabs value={currentView === 'signin' ? 'signin' : 'signup'} onValueChange={(v) => {
        setCurrentView(v as AuthView);
        clearMessages();
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin" className="space-y-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            {authError && currentView === 'signin' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('forgot-password');
                  clearMessages();
                }}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="signup" className="space-y-4">
          <form onSubmit={handleSignUp} className="space-y-4">
            {authError && currentView === 'signup' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min. 6 characters)"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Terms and Privacy Checkbox */}
            <div className="flex items-start space-x-2 py-2">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                I agree to the{' '}
                <Link to="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>
                {' '}and{' '}
                <Link to="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</Link>
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !agreedToTerms}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          className="w-full mt-4"
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <motion.div 
              className="flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">CW</span>
              </div>
              <span className="text-2xl font-bold text-foreground">ClauseWise</span>
            </motion.div>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome</h1>
          <p className="text-muted-foreground">Your intelligent financial document assistant</p>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl">
              {currentView === 'verify-otp' && 'Verify Email'}
              {currentView === 'forgot-password' && 'Reset Password'}
              {currentView === 'reset-password' && 'New Password'}
              {(currentView === 'signin' || currentView === 'signup') && 'Get Started'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentView === 'verify-otp' && renderOTPView()}
            {currentView === 'forgot-password' && renderForgotPasswordView()}
            {currentView === 'reset-password' && renderResetPasswordView()}
            {(currentView === 'signin' || currentView === 'signup') && renderAuthTabs()}

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Need help?{' '}
          <Link to="/help" className="text-primary hover:underline">Visit our Help Center</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
