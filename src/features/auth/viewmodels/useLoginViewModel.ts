import { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { isValidIndianPhone } from '@/core/utils';
import { authRepository } from '@/data/repositories/authRepository';
import { completeSignIn } from '@/domain/session';
import { RootStackParamList } from '@/navigation/types';
import { toast } from '@/store/useToastStore';

export const useLoginViewModel = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [phone, setPhoneRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<'otp' | 'google' | 'apple' | null>(null);

  const setPhone = useCallback((v: string) => {
    setPhoneRaw(v.replace(/\D/g, '').slice(0, 10));
    setError(null);
  }, []);

  const isValid = isValidIndianPhone(phone);

  const sendCode = useCallback(async () => {
    if (!isValid) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading('otp');
    try {
      await authRepository.sendOtp(phone);
      nav.navigate('Otp', { phone });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(null);
    }
  }, [isValid, phone, nav]);

  const social = useCallback(async (provider: 'google' | 'apple') => {
    setLoading(provider);
    try {
      const result = await authRepository.socialSignIn(provider);
      toast.success(`Signed in with ${provider === 'google' ? 'Google' : 'Apple'}`, 'Let’s set up your profile');
      completeSignIn(result);
    } catch (e) {
      toast.error('Sign-in failed', (e as Error).message);
    } finally {
      setLoading(null);
    }
  }, []);

  const fillDemo = useCallback((num: string) => setPhone(num), [setPhone]);

  return { phone, setPhone, error, loading, isValid, sendCode, social, fillDemo };
};
