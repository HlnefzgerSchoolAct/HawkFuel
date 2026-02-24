import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Target,
  TrendingDown,
  Scale,
  Heart,
  Zap,
  Dumbbell,
  Flame,
  User,
  Activity,
  Utensils,
} from 'lucide-react';
import {
  loadOnboardingDraft,
  saveOnboardingDraft,
  clearOnboardingDraft,
} from '../utils/localStorage';
import './Onboarding.css';

/**
 * Enhanced Onboarding Flow Component
 * 
 * Multi-step wizard for new user setup with:
 * - Welcome screen
 * - Goal selection
 * - Personal info (age, height, weight)
 * - Activity level
 * - Summary with calculated targets
 */

// Goal options
const GOALS = [
  {
    id: 'lose',
    title: 'Lose Weight',
    description: 'Create a calorie deficit to lose weight safely',
    icon: TrendingDown
  },
  {
    id: 'maintain',
    title: 'Maintain Weight',
    description: 'Keep your current weight and stay healthy',
    icon: Scale
  },
  {
    id: 'gain',
    title: 'Build Muscle',
    description: 'Gain lean muscle with a calorie surplus',
    icon: Dumbbell
  },
  {
    id: 'health',
    title: 'Improve Health',
    description: 'Focus on nutrition quality and balance',
    icon: Heart
  }
];

// Activity level options
const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    label: 'Sedentary',
    description: 'Little or no exercise',
    icon: User,
    multiplier: 1.2
  },
  {
    id: 'light',
    label: 'Light',
    description: 'Exercise 1-3 days/week',
    icon: Activity,
    multiplier: 1.375
  },
  {
    id: 'moderate',
    label: 'Moderate',
    description: 'Exercise 3-5 days/week',
    icon: Zap,
    multiplier: 1.55
  },
  {
    id: 'active',
    label: 'Active',
    description: 'Exercise 6-7 days/week',
    icon: Flame,
    multiplier: 1.725
  }
];

// Convert form values to metric for BMR (Mifflin-St Jeor uses kg, cm)
const toMetricForBMR = (formData) => {
  const age = parseInt(formData.age, 10) || 30;
  const sex = formData.sex || 'male';
  let weightKg, heightCm;

  if (formData.units === 'imperial') {
    const feet = parseInt(formData.heightFeet, 10) || 5;
    const inches = parseInt(formData.heightInches, 10) || 10;
    heightCm = (feet * 12 + inches) * 2.54;
    weightKg = (parseFloat(formData.weight) || 160) * 0.453592;
  } else {
    heightCm = parseFloat(formData.height) || 170;
    weightKg = parseFloat(formData.weight) || 70;
  }

  return { weightKg, heightCm, age, sex };
};

// Calculate BMR using Mifflin-St Jeor (inputs in kg, cm)
const calculateBMR = (weightKg, heightCm, age, sex) => {
  if (sex === 'female') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
};

// Calculate daily calories based on goal
const calculateCalories = (bmr, activityLevel, goal) => {
  const activity = ACTIVITY_LEVELS.find(a => a.id === activityLevel);
  const tdee = bmr * (activity?.multiplier || 1.2);
  
  switch (goal) {
    case 'lose':
      return Math.round(tdee - 500); // 0.5kg/week deficit
    case 'gain':
      return Math.round(tdee + 300); // Lean bulk surplus
    default:
      return Math.round(tdee);
  }
};

// Calculate macros based on goal
const calculateMacros = (calories, goal) => {
  let proteinRatio, carbRatio, fatRatio;
  
  switch (goal) {
    case 'lose':
      proteinRatio = 0.35; // Higher protein for satiety
      fatRatio = 0.30;
      carbRatio = 0.35;
      break;
    case 'gain':
      proteinRatio = 0.30;
      fatRatio = 0.25;
      carbRatio = 0.45; // More carbs for muscle
      break;
    default:
      proteinRatio = 0.25;
      fatRatio = 0.30;
      carbRatio = 0.45;
  }
  
  return {
    protein: Math.round((calories * proteinRatio) / 4), // 4 cal/g
    carbs: Math.round((calories * carbRatio) / 4),
    fat: Math.round((calories * fatRatio) / 9) // 9 cal/g
  };
};

/**
 * Onboarding Component
 */
const Onboarding = ({
  onComplete,
  onSkip,
  initialStep = 0
}) => {
  const defaultFormData = {
    goal: null,
    sex: null,
    age: '',
    height: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    targetWeight: '',
    activityLevel: null,
    name: '',
    units: 'metric'
  };

  const draft = loadOnboardingDraft();
  const [currentStep, setCurrentStep] = useState(
    draft?.currentStep ?? initialStep
  );
  const [exitingStep, setExitingStep] = useState(null);
  const [formData, setFormData] = useState(
    draft?.formData ? { ...defaultFormData, ...draft.formData } : defaultFormData
  );

  const steps = useMemo(() => ['welcome', 'goal', 'info', 'activity', 'summary'], []);

  useEffect(() => {
    saveOnboardingDraft({ currentStep, formData });
  }, [currentStep, formData]);
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSkip = useCallback(() => {
    clearOnboardingDraft();
    onSkip?.();
  }, [onSkip]);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setExitingStep(currentStep);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setExitingStep(null);
      }, 200);
    }
  }, [currentStep, totalSteps]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setExitingStep(currentStep);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setExitingStep(null);
      }, 200);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    clearOnboardingDraft();
    const { weightKg, heightCm, age, sex } = toMetricForBMR(formData);
    const bmr = calculateBMR(weightKg, heightCm, age, sex);

    const calories = calculateCalories(bmr, formData.activityLevel, formData.goal);
    const macros = calculateMacros(calories, formData.goal);

    onComplete?.({
      ...formData,
      calorieGoal: calories,
      macroGoals: macros
    });
  }, [formData, onComplete]);

  // Calculate estimated values for summary
  const calculatedValues = useMemo(() => {
    const { weightKg, heightCm, age, sex } = toMetricForBMR(formData);
    const bmr = calculateBMR(weightKg, heightCm, age, sex);

    const calories = calculateCalories(bmr, formData.activityLevel, formData.goal);
    const macros = calculateMacros(calories, formData.goal);

    return { calories, macros };
  }, [formData]);

  // Step validation
  const canProceed = useMemo(() => {
    switch (steps[currentStep]) {
      case 'goal':
        return !!formData.goal;
      case 'info':
        if (!formData.sex || !formData.age) return false;
        if (formData.units === 'imperial') {
          const hasFeet = formData.heightFeet !== undefined && formData.heightFeet !== '';
          const hasInches = formData.heightInches !== undefined; // '' means 0
          return hasFeet && hasInches && formData.weight !== '' && formData.weight !== undefined;
        }
        return formData.height && formData.weight;
      case 'activity':
        return !!formData.activityLevel;
      default:
        return true;
    }
  }, [currentStep, formData, steps]);

  const renderStep = () => {
    const step = steps[currentStep];
    const isExiting = exitingStep === currentStep;
    
    switch (step) {
      case 'welcome':
        return (
          <WelcomeStep 
            isExiting={isExiting}
            name={formData.name}
            onNameChange={(name) => updateFormData('name', name)}
            onSkipSetup={handleSkip}
          />
        );
      case 'goal':
        return (
          <GoalStep 
            isExiting={isExiting}
            selected={formData.goal}
            onSelect={(goal) => updateFormData('goal', goal)}
          />
        );
      case 'info':
        return (
          <InfoStep 
            isExiting={isExiting}
            data={formData}
            onChange={updateFormData}
          />
        );
      case 'activity':
        return (
          <ActivityStep 
            isExiting={isExiting}
            selected={formData.activityLevel}
            onSelect={(level) => updateFormData('activityLevel', level)}
          />
        );
      case 'summary':
        return (
          <SummaryStep 
            isExiting={isExiting}
            data={formData}
            calculated={calculatedValues}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="m3-onboarding">
      <div className="m3-onboarding__container">
        {/* Header */}
        <div className="m3-onboarding__header">
          <button 
            className="m3-onboarding__back"
            onClick={goBack}
            disabled={currentStep === 0}
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          
          {currentStep < totalSteps - 1 && (
            <button 
              className="m3-onboarding__skip"
              onClick={handleSkip}
            >
              Skip
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="m3-onboarding__progress">
          <div className="m3-onboarding__progress-bar">
            <div
              className="m3-onboarding__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="m3-onboarding__step-dots">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`m3-onboarding__step-dot ${
                  index === currentStep ? 'm3-onboarding__step-dot--active' : ''
                } ${index < currentStep ? 'm3-onboarding__step-dot--completed' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="m3-onboarding__content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="m3-onboarding__footer">
          <div className="m3-onboarding__actions">
            {currentStep === totalSteps - 1 ? (
              <button 
                className="m3-onboarding__btn m3-onboarding__btn--primary"
                onClick={handleComplete}
              >
                Get Started
              </button>
            ) : (
              <button 
                className="m3-onboarding__btn m3-onboarding__btn--primary"
                onClick={goNext}
                disabled={!canProceed}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== Step Components =====

const WelcomeStep = ({ isExiting, name, onNameChange, onSkipSetup }) => (
  <div className={`m3-onboarding__step ${isExiting ? 'm3-onboarding__step--exiting' : ''}`}>
    <div className="m3-onboarding__illustration">
      <div className="m3-onboarding__illustration-container">
        <div className="m3-onboarding__illustration-bg" />
        <Utensils className="m3-onboarding__illustration-icon" size={80} />
      </div>
    </div>
    
    <h1 className="m3-onboarding__title">Welcome to NutriNote+</h1>
    <p className="m3-onboarding__description">
      Track your nutrition, reach your goals, and build healthy habits.
      Let&apos;s personalize your experience.
    </p>
    
    <div className="m3-onboarding__form">
      <div className="m3-onboarding__form-group">
        <label className="m3-onboarding__form-label">What should we call you?</label>
        <input
          type="text"
          className="m3-text-field__input"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          style={{
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--m3-outline-variant)',
            background: 'var(--m3-surface-container)',
            fontSize: '16px'
          }}
        />
      </div>
      <button
        type="button"
        className="m3-onboarding__skip-setup"
        onClick={onSkipSetup}
      >
        Skip setup — use defaults
      </button>
    </div>
  </div>
);

const GoalStep = ({ isExiting, selected, onSelect }) => (
  <div className={`m3-onboarding__step ${isExiting ? 'm3-onboarding__step--exiting' : ''}`}>
    <h1 className="m3-onboarding__title">What&apos;s your goal?</h1>
    <p className="m3-onboarding__description">
      We&apos;ll customize your daily targets based on your goal.
    </p>
    
    <div className="m3-onboarding__goals">
      {GOALS.map(goal => {
        const Icon = goal.icon;
        const isSelected = selected === goal.id;
        
        return (
          <button
            key={goal.id}
            className={`m3-onboarding__goal ${isSelected ? 'm3-onboarding__goal--selected' : ''}`}
            onClick={() => onSelect(goal.id)}
          >
            <div className="m3-onboarding__goal-icon">
              <Icon size={28} />
            </div>
            <div className="m3-onboarding__goal-content">
              <h3 className="m3-onboarding__goal-title">{goal.title}</h3>
              <p className="m3-onboarding__goal-description">{goal.description}</p>
            </div>
            <div className="m3-onboarding__goal-check">
              {isSelected && <Check size={16} />}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid var(--m3-outline-variant)',
  background: 'var(--m3-surface-container)',
  fontSize: '16px'
};

const InfoStep = ({ isExiting, data, onChange }) => {
  const isImperial = data.units === 'imperial';

  return (
    <div className={`m3-onboarding__step ${isExiting ? 'm3-onboarding__step--exiting' : ''}`}>
      <h1 className="m3-onboarding__title">Tell us about yourself</h1>
      <p className="m3-onboarding__description">
        This helps us calculate your daily calorie needs.
      </p>

      <div className="m3-onboarding__form">
        {/* Unit toggle */}
        <div className="m3-onboarding__form-group">
          <label className="m3-onboarding__form-label">Units</label>
          <div className="m3-onboarding__selections" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {[
              { id: 'metric', label: 'Metric (cm, kg)' },
              { id: 'imperial', label: 'Imperial (ft, lb)' }
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`m3-onboarding__selection ${data.units === id ? 'm3-onboarding__selection--selected' : ''}`}
                onClick={() => onChange('units', id)}
              >
                <span className="m3-onboarding__selection-label">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sex selection */}
        <div className="m3-onboarding__form-group">
          <label className="m3-onboarding__form-label">Sex</label>
          <div className="m3-onboarding__selections" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {['male', 'female'].map(sex => (
              <button
                key={sex}
                type="button"
                className={`m3-onboarding__selection ${data.sex === sex ? 'm3-onboarding__selection--selected' : ''}`}
                onClick={() => onChange('sex', sex)}
              >
                <span className="m3-onboarding__selection-label" style={{ textTransform: 'capitalize' }}>
                  {sex}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Age */}
        <div className="m3-onboarding__form-group">
          <label className="m3-onboarding__form-label">Age</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Years"
            value={data.age}
            onChange={(e) => onChange('age', e.target.value)}
            min={13}
            max={120}
            style={inputStyle}
          />
        </div>

        {/* Height & Weight */}
        <div className="m3-onboarding__form-row">
          {isImperial ? (
            <>
              <div className="m3-onboarding__form-group">
                <label className="m3-onboarding__form-label">Height (ft)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="5"
                  value={data.heightFeet}
                  onChange={(e) => onChange('heightFeet', e.target.value)}
                  min={3}
                  max={8}
                  style={inputStyle}
                />
              </div>
              <div className="m3-onboarding__form-group">
                <label className="m3-onboarding__form-label">Height (in)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="10"
                  value={data.heightInches}
                  onChange={(e) => onChange('heightInches', e.target.value)}
                  min={0}
                  max={11}
                  style={inputStyle}
                />
              </div>
            </>
          ) : (
            <div className="m3-onboarding__form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="m3-onboarding__form-label">Height (cm)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="170"
                value={data.height}
                onChange={(e) => onChange('height', e.target.value)}
                style={inputStyle}
              />
            </div>
          )}
          <div className={`m3-onboarding__form-group ${!isImperial ? '' : ''}`} style={isImperial ? {} : { gridColumn: '1 / -1' }}>
            <label className="m3-onboarding__form-label">Weight ({isImperial ? 'lb' : 'kg'})</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder={isImperial ? '160' : '70'}
              value={data.weight}
              onChange={(e) => onChange('weight', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityStep = ({ isExiting, selected, onSelect }) => (
  <div className={`m3-onboarding__step ${isExiting ? 'm3-onboarding__step--exiting' : ''}`}>
    <h1 className="m3-onboarding__title">Activity Level</h1>
    <p className="m3-onboarding__description">
      How active are you on a typical week?
    </p>
    
    <div className="m3-onboarding__selections">
      {ACTIVITY_LEVELS.map(level => {
        const Icon = level.icon;
        const isSelected = selected === level.id;
        
        return (
          <button
            key={level.id}
            className={`m3-onboarding__selection ${isSelected ? 'm3-onboarding__selection--selected' : ''}`}
            onClick={() => onSelect(level.id)}
          >
            <div className="m3-onboarding__selection-icon">
              <Icon size={24} />
            </div>
            <span className="m3-onboarding__selection-label">{level.label}</span>
            <span className="m3-onboarding__selection-description">{level.description}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const SummaryStep = ({ isExiting, data, calculated }) => {
  const goalLabel = GOALS.find(g => g.id === data.goal)?.title || 'Stay Healthy';
  
  return (
    <div className={`m3-onboarding__step ${isExiting ? 'm3-onboarding__step--exiting' : ''}`}>
      <div className="m3-onboarding__illustration">
        <div className="m3-onboarding__illustration-container">
          <div className="m3-onboarding__illustration-bg" />
          <Target className="m3-onboarding__illustration-icon" size={80} />
        </div>
      </div>
      
      <h1 className="m3-onboarding__title">You&apos;re all set!</h1>
      <p className="m3-onboarding__description">
        Here are your personalized daily targets to {goalLabel.toLowerCase()}.
      </p>
      
      <div className="m3-onboarding__summary">
        <div className="m3-onboarding__summary-card">
          <div className="m3-onboarding__summary-label">Daily Calorie Goal</div>
          <div className="m3-onboarding__summary-value">
            {calculated.calories.toLocaleString()} kcal
          </div>
        </div>
        
        <div className="m3-onboarding__summary-grid">
          <div className="m3-onboarding__summary-item">
            <div className="m3-onboarding__summary-label">Protein</div>
            <div className="m3-onboarding__summary-value" style={{ fontSize: '18px' }}>
              {calculated.macros.protein}g
            </div>
          </div>
          <div className="m3-onboarding__summary-item">
            <div className="m3-onboarding__summary-label">Carbs</div>
            <div className="m3-onboarding__summary-value" style={{ fontSize: '18px' }}>
              {calculated.macros.carbs}g
            </div>
          </div>
          <div className="m3-onboarding__summary-item">
            <div className="m3-onboarding__summary-label">Fat</div>
            <div className="m3-onboarding__summary-value" style={{ fontSize: '18px' }}>
              {calculated.macros.fat}g
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
