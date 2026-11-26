import { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNow } from '@/core/hooks';
import { haptics } from '@/core/services/haptics';
import { isValidIndianPhone } from '@/core/utils';
import { profileRepository } from '@/data/repositories/profileRepository';
import { RootStackParamList } from '@/navigation/types';
import { useDiscoveryStore } from '@/store/useDiscoveryStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { usePremiumStore } from '@/store/usePremiumStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { toast } from '@/store/useToastStore';

export const CHECKIN_OPTIONS = [
  { label: '30 min', ms: 30 * 60000 },
  { label: '1 hour', ms: 60 * 60000 },
  { label: '2 hours', ms: 120 * 60000 },
];

export const useSafetyViewModel = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const verifiedOnly = useDiscoveryStore(s => s.filters.verifiedOnly);
  const setFilters = useDiscoveryStore(s => s.setFilters);
  const trustedContact = useSettingsStore(s => s.trustedContact);
  const setTrustedContact = useSettingsStore(s => s.setTrustedContact);
  const screenshotAlerts = useSettingsStore(s => s.privacy.screenshotAlerts);
  const setPrivacy = useSettingsStore(s => s.setPrivacy);
  const incognito = useSettingsStore(s => s.incognito);
  const setIncognito = useSettingsStore(s => s.setIncognito);
  const blockedIds = useSettingsStore(s => s.blockedIds);
  const unblock = useSettingsStore(s => s.unblock);
  const plan = usePremiumStore(s => s.plan);

  const [checkInEndsAt, setCheckInEndsAt] = useState<number | null>(null);
  const [sosSent, setSosSent] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [name, setName] = useState(trustedContact?.name ?? '');
  const [phone, setPhone] = useState(trustedContact?.phone ?? '');
  const now = useNow(1000, !!checkInEndsAt);

  const startCheckIn = useCallback(
    (ms: number) => {
      if (!trustedContact) {
        setContactOpen(true);
        toast.info('Add a trusted contact first', 'They’ll be alerted if you don’t check in.');
        return;
      }
      setCheckInEndsAt(Date.now() + ms);
      haptics.success();
      toast.success('Date check-in started', `We’ll check on you. ${trustedContact.name} has your date details.`);
    },
    [trustedContact],
  );

  const imSafe = useCallback(() => {
    setCheckInEndsAt(null);
    haptics.success();
    toast.success('Glad you’re safe 💛', 'Check-in ended.');
  }, []);

  const triggerSos = useCallback(() => {
    haptics.warning();
    setSosSent(true);
    useNotificationStore.getState().push({
      kind: 'safety',
      title: 'SOS sent',
      body: `${trustedContact?.name ?? 'Your trusted contact'} received your live location and date details.`,
    });
  }, [trustedContact]);

  const saveContact = useCallback(() => {
    if (name.trim().length < 2 || !isValidIndianPhone(phone)) {
      return false;
    }
    setTrustedContact({ name: name.trim(), phone });
    setContactOpen(false);
    toast.success('Trusted contact saved', `${name.trim()} can now receive your date details.`);
    return true;
  }, [name, phone, setTrustedContact]);

  return {
    verifiedOnly,
    setVerifiedOnly: (v: boolean) => setFilters({ verifiedOnly: v }),
    trustedContact,
    screenshotAlerts,
    setScreenshotAlerts: (v: boolean) => setPrivacy('screenshotAlerts', v),
    incognito,
    incognitoLocked: plan !== 'platinum',
    setIncognito: (v: boolean) => (plan === 'platinum' ? setIncognito(v) : nav.navigate('Paywall', { reason: 'incognito' })),
    blocked: blockedIds.map(id => profileRepository.getById(id)).filter(Boolean),
    unblock,
    checkInActive: !!checkInEndsAt && checkInEndsAt > now,
    checkInRemaining: checkInEndsAt ? Math.max(0, checkInEndsAt - now) : 0,
    startCheckIn,
    imSafe,
    sosSent,
    triggerSos,
    resetSos: () => setSosSent(false),
    contactOpen,
    setContactOpen,
    name,
    setName,
    phone,
    setPhone: (v: string) => setPhone(v.replace(/\D/g, '').slice(0, 10)),
    contactValid: name.trim().length >= 2 && isValidIndianPhone(phone),
    saveContact,
    removeContact: () => {
      setTrustedContact(null);
      setName('');
      setPhone('');
    },
  };
};
