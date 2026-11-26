import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import { Asset, ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';

/**
 * Photo source facade: camera (selfie by default) or the device gallery.
 * Returns local file URIs, or [] when the user cancels / denies.
 */

const COMMON = { mediaType: 'photo' as const, quality: 0.8 as const, maxWidth: 1600, maxHeight: 1600 };

const openSettingsAlert = (what: string) =>
  Alert.alert(
    `${what} access needed`,
    `Allow ${what.toLowerCase()} access in Settings to add photos.`,
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ],
  );

/** Android declares CAMERA in the manifest, so it must be granted at runtime. iOS prompts on its own. */
const ensureCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }
  const perm = PermissionsAndroid.PERMISSIONS.CAMERA;
  if (await PermissionsAndroid.check(perm)) {
    return true;
  }
  const result = await PermissionsAndroid.request(perm, {
    title: 'Camera permission',
    message: 'Allow camera access so you can take a photo or selfie for your profile.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });
  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    openSettingsAlert('Camera');
  }
  return false;
};

const toUris = (res: ImagePickerResponse, source: 'Camera' | 'Photos'): string[] => {
  if (res.didCancel) {
    return [];
  }
  if (res.errorCode) {
    if (res.errorCode === 'permission') {
      openSettingsAlert(source);
    } else if (res.errorCode === 'camera_unavailable') {
      Alert.alert('Camera unavailable', 'This device has no camera available.');
    } else {
      Alert.alert('Could not add photo', res.errorMessage ?? 'Please try again.');
    }
    return [];
  }
  return (res.assets ?? []).map((a: Asset) => a.uri).filter((u): u is string => !!u);
};

export const mediaPicker = {
  /** Opens the camera (front-facing by default, for selfies). */
  takePhoto: async (cameraType: 'front' | 'back' = 'front'): Promise<string[]> => {
    if (!(await ensureCameraPermission())) {
      return [];
    }
    const res = await launchCamera({ ...COMMON, cameraType, saveToPhotos: false });
    return toUris(res, 'Camera');
  },

  /** Opens the system photo picker. Android 13+ needs no storage permission for this. */
  pickFromGallery: async (limit = 1): Promise<string[]> => {
    const res = await launchImageLibrary({ ...COMMON, selectionLimit: Math.max(1, limit) });
    return toUris(res, 'Photos');
  },
};
