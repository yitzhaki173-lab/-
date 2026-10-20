// מנגנון עדכון גרסה מובנה באפליקציה (OTA Config/JS Bundle + הורדת APK חדש מ-GitHub Releases)
import RNFS from 'react-native-fs';

export interface VersionManifest {
  version: string;
  buildNumber: number;
  apkDownloadUrl: string;
  otaBundleUrl: string;
  changelog: string[];
}

const UPDATE_MANIFEST_URL = 'https://raw.githubusercontent.com/user/packtrack-il/main/version-manifest.json';

export async function checkForAppUpdate(currentVersion: string): Promise<{ hasUpdate: boolean; manifest?: VersionManifest }> {
  try {
    const res = await fetch(UPDATE_MANIFEST_URL, { cache: 'no-store' });
    const manifest: VersionManifest = await res.json();
    return {
      hasUpdate: manifest.version !== currentVersion,
      manifest
    };
  } catch {
    return { hasUpdate: false };
  }
}

export async function downloadAndInstallApkUpdate(apkUrl: string, onProgress?: (pct: number) => void): Promise<string> {
  const destPath = `${RNFS.ExternalDirectoryPath}/PackTrackIL-update.apk`;
  const download = RNFS.downloadFile({
    fromUrl: apkUrl,
    toFile: destPath,
    progress: (res) => {
      if (onProgress && res.contentLength > 0) {
        onProgress(Math.round((res.bytesWritten / res.contentLength) * 100));
      }
    }
  });
  await download.promise;
  return destPath;
}
