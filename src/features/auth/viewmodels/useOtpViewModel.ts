import { useCallback, useEffect, useState } from 'react';
import { haptics } from '@/core/services/haptics';
import { authRepository } from '@/data/repositories/authRepository';
import { completeSignIn } from '@/domain/session';
import { toast } from '@/store/useToastStore';

export const OTP_LENGTH = 6;

export const useOtpViewModel = (phone: string, onError: () => void) => {
  const [code, setCodeRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(30);

  useEffect(() => {
    if (resendIn <= 0) {
      return;
    }
    const t = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const verify = useCallback(
    async (value: string) => {
      setVerifying(true);
      try {
        const result = await authRepository.verifyOtp(phone, value);
        haptics.success();
        if (result.user) {
          toast.success(`Welcome back, ${result.user.name.split(' ')[0]} 👋`);
        }
        completeSignIn(result);
      } catch (e) {
        haptics.warning();
        setError((e as Error).message);
        setCodeRaw('');
        onError();
      } finally {
        setVerifying(false);
      }
    },
    [phone, onError],
  );

  const setCode = useCallback(
    (v: string) => {
      const digits = v.replace(/\D/g, '').slice(0, OTP_LENGTH);
      setCodeRaw(digits);
      setError(null);
      if (digits.length === OTP_LENGTH) {
        verify(digits);
      }
    },
    [verify],
  );

  const resend = useCallback(async () => {
    if (resendIn > 0) {
      return;
    }
    await authRepository.sendOtp(phone);
    setResendIn(30);
    toast.info('Code sent again', 'Use 123456 for the demo');
  }, [phone, resendIn]);

  return { code, setCode, error, verifying, resendIn, resend, verify };
};
