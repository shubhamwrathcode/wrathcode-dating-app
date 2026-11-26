import React, { useState } from 'react';
import { PhotoGrid } from '@/components';
import { PHOTOS_MIN } from '@/core/constants';
import { pickerGallery } from '@/data/mock/photos';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { useOnboardingViewModel } from '../viewmodels/useOnboardingViewModel';

export const PhotosScreen = () => {
  const vm = useOnboardingViewModel('OnbPhotos');
  const [photos, setPhotos] = useState<string[]>(vm.draft.photos ?? []);
  const remaining = Math.max(0, PHOTOS_MIN - photos.length);

  return (
    <OnboardingLayout
      title="Add your best photos"
      subtitle="Add at least 2 photos. Clear, recent photos of you get 3× more matches."
      progress={vm.progress}
      animate={false}
      animated={false}
      canContinue={remaining === 0}
      footerNote={remaining ? `Add ${remaining} more photo${remaining > 1 ? 's' : ''} to continue` : undefined}
      onContinue={() => vm.next({ photos })}>
      <PhotoGrid animated={false} photos={photos} onChange={setPhotos} gallery={pickerGallery(vm.draft.gender ?? 'woman')} />
    </OnboardingLayout>
  );
};
