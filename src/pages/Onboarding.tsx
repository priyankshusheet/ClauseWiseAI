
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, CheckCircle, Upload, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    occupation: '',
    primaryUseCases: [],
    financialLiteracyLevel: '',
    preferredLanguage: 'english',
    consentGiven: false,
    startCourse: false
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  const totalSteps = 4;

  const occupations = [
    'Student',
    'Salaried Employee',
    'Business Owner',
    'Freelancer',
    'Retired',
    'Homemaker',
    'Other'
  ];

  const useCases = [
    { id: 'insurance', label: 'Insurance Policies', icon: '🛡️' },
    { id: 'credit-card', label: 'Credit Cards', icon: '💳' },
    { id: 'loans', label: 'Loans & EMIs', icon: '🏦' },
    { id: 'investments', label: 'Investments & Mutual Funds', icon: '📈' },
    { id: 'banking', label: 'Banking Services', icon: '💰' },
    { id: 'tax', label: 'Tax Documents', icon: '📋' }
  ];

  const literacyLevels = [
    { value: 'beginner', label: 'Beginner', desc: 'New to financial products' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Some experience with financial products' },
    { value: 'advanced', label: 'Advanced', desc: 'Good understanding of financial products' }
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'both', label: 'Both English & Hindi' }
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
      } else {
        setUser(user);
        setFormData(prev => ({
          ...prev,
          fullName: user.user_metadata?.full_name || ''
        }));
      }
    };
    checkAuth();
  }, [navigate]);

  const handleUseCaseToggle = (useCaseId: string) => {
    setFormData(prev => ({
      ...prev,
      primaryUseCases: prev.primaryUseCases.includes(useCaseId)
        ? prev.primaryUseCases.filter(id => id !== useCaseId)
        : [...prev.primaryUseCases, useCaseId]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!formData.consentGiven) {
      toast({
        title: "Consent Required",
        description: "Please agree to the terms to continue",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Here you would typically save the user profile data
      // For now, we'll just show success and redirect
      
      toast({
        title: "Welcome to ClauseWise!",
        description: "Your profile has been set up successfully.",
      });

      // Redirect based on user's choice
      if (formData.startCourse) {
        navigate('/learn');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim() && formData.occupation;
      case 2:
        return formData.primaryUseCases.length > 0;
      case 3:
        return formData.financialLiteracyLevel && formData.preferredLanguage;
      case 4:
        return formData.consentGiven;
      default:
        return false;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">CW</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">ClauseWise</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's Get to Know You</h1>
          <p className="text-gray-600">Help us personalize your financial assistant experience</p>
          
          {/* Progress Bar */}
          <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Step {currentStep} of {totalSteps}</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Your Financial Needs"}
              {currentStep === 3 && "Preferences"}
              {currentStep === 4 && "Terms & Getting Started"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+91 9876543210"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Occupation/Profession *</Label>
                  <Select 
                    value={formData.occupation} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, occupation: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      {occupations.map(occupation => (
                        <SelectItem key={occupation} value={occupation.toLowerCase()}>
                          {occupation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Use Cases */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    What type of documents do you need help with? *
                  </Label>
                  <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {useCases.map(useCase => (
                    <div
                      key={useCase.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.primaryUseCases.includes(useCase.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleUseCaseToggle(useCase.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{useCase.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{useCase.label}</span>
                            <Checkbox
                              checked={formData.primaryUseCases.includes(useCase.id)}
                              onChange={() => handleUseCaseToggle(useCase.id)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Financial Literacy Level *</Label>
                  <RadioGroup
                    value={formData.financialLiteracyLevel}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, financialLiteracyLevel: value }))}
                  >
                    {literacyLevels.map(level => (
                      <div key={level.value} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value={level.value} id={level.value} />
                        <div className="flex-1">
                          <Label htmlFor={level.value} className="font-medium cursor-pointer">
                            {level.label}
                          </Label>
                          <p className="text-sm text-gray-600">{level.desc}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Preferred Language *</Label>
                  <Select 
                    value={formData.preferredLanguage} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, preferredLanguage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: Terms & Next Steps */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <Checkbox
                      id="consent"
                      checked={formData.consentGiven}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consentGiven: checked === true }))}
                    />
                    <div className="flex-1">
                      <Label htmlFor="consent" className="text-sm cursor-pointer">
                        I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>. 
                        I understand that ClauseWise provides information and analysis for educational purposes and does not constitute financial advice.
                      </Label>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id="course"
                      checked={formData.startCourse}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, startCourse: checked === true }))}
                    />
                    <div className="flex-1">
                      <Label htmlFor="course" className="font-medium cursor-pointer">
                        Start your 30-day Financial Literacy Course today
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Learn about insurance, credit cards, loans, and investments through our comprehensive course.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/upload')}>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-medium">Upload Document</h3>
                    <p className="text-sm text-gray-600">Analyze your financial documents</p>
                  </Card>
                  
                  <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/chat')}>
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-medium">Start Chatting</h3>
                    <p className="text-sm text-gray-600">Ask questions about financial products</p>
                  </Card>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNext}
                  disabled={!isStepValid()}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  disabled={!isStepValid() || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? "Setting up..." : "Complete Setup"}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
