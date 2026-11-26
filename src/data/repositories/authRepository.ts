import { DEMO_OTP } from '@/core/constants';
import { delay } from '@/core/utils';
import { CurrentUser } from '@/data/models';
import { DEMO_ACCOUNTS } from '@/data/mock/demoAccounts';

export interface AuthResult {
  phone: string;
  /** Existing account (skips onboarding) or null for a new user. */
  user: CurrentUser | null;
  provider: 'phone' | 'google' | 'apple';
}

/**
 * Auth repository. Static today; production swaps internals for
 * Firebase Auth / MSG91 + JWT with the same method signatures.
 */
export const authRepository = {
  async sendOtp(phone: string): Promise<{ requestId: string; resendInSec: number }> {
    await delay(900);
    return { requestId: `otp_${phone}_${Date.now()}`, resendInSec: 30 };
  },

  async verifyOtp(phone: string, code: string): Promise<AuthResult> {
    await delay(800);
    if (code !== DEMO_OTP) {
      throw new Error('That code doesn’t look right. Try 123456 for the demo.');
    }
    return { phone, user: DEMO_ACCOUNTS[phone] ?? null, provider: 'phone' };
  },

  async socialSignIn(provider: 'google' | 'apple'): Promise<AuthResult> {
    await delay(1100);
    return { phone: '', user: null, provider };
  },

  isDemoAccount(phone: string) {
    return Boolean(DEMO_ACCOUNTS[phone]);
  },
};
