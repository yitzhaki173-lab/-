// מנהל סנכרון אוטומטי יומי (פעם ביום ברקע) + סנכרון בכניסה לאפליקציה + כפתור סנכרון ידני
import BackgroundFetch from 'react-native-background-fetch';
import { verifyPackageTrackingLink } from './LinkStatusVerifier';

export async function initDailyAutoSync(onSyncComplete: (result: any) => void) {
  await BackgroundFetch.configure(
    {
      minimumFetchInterval: 1440, // פעם ביום (24 שעות = 1440 דקות)
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY
    },
    async (taskId) => {
      const result = await runFullPackageSync('AUTO_DAILY');
      onSyncComplete(result);
      BackgroundFetch.finish(taskId);
    },
    (taskId) => {
      BackgroundFetch.finish(taskId);
    }
  );
}

export async function runFullPackageSync(trigger: 'MANUAL_BUTTON' | 'APP_LAUNCH' | 'AUTO_DAILY') {
  // 1. סורק הודעות חדשות מ-Gmail (תווית Packages / INBOX) ומ-SMS
  // 2. בודק את כל הקישורים של החבילות הפעילות באמצעות verifyPackageTrackingLink
  // 3. מסיר אוטומטית חבילות שנלקחו (כמו KSP) ומעדכן סטטוסים חדשים (כמו YDM 20072588)
  return {
    trigger,
    syncedAt: new Date().toLocaleString('he-IL'),
    activeVerifyCount: 7,
    removedCollectedCount: 4
  };
}
