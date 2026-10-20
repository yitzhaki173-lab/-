// בודק אוטומטית את קישור המעקב / התור (KSP, YDM, געש, דואר ישראל, צ'יטה)
// ומזהה אם החבילה כבר נלקחה או נמסרה כדי להסיר אותה מרשימת החבילות הפעילות

export interface LinkVerifyResponse {
  collected: boolean;
  statusSummary: string;
  checkedAt: string;
}

const DELIVERED_KEYWORDS = [
  'נמסר',
  'נמסרה',
  'נאסף',
  'נאספה',
  'סופק',
  'הופקה חשבונית',
  'תודה שבחרתם',
  'נשמח לקבל מכם משוב על הזמנה',
  'התור פג תוקף - ההזמנה סופקה',
  'Delivered',
  'Picked up'
];

export async function verifyPackageTrackingLink(url: string, emailFollowUpSnippet?: string): Promise<LinkVerifyResponse> {
  const nowStr = new Date().toLocaleString('he-IL');

  // 1. בדיקת מייל משוב לאחר איסוף (כמו ב-KSP שנשלח מיד לאחר מסירת החבילה בסניף)
  if (emailFollowUpSnippet && DELIVERED_KEYWORDS.some(k => emailFollowUpSnippet.includes(k))) {
    return {
      collected: true,
      statusSummary: 'זוהה איסוף מאושר מהמייל / חשבונית מסירה — הוסר מהמערכת',
      checkedAt: nowStr
    };
  }

  // 2. בדיקה חיה של קישור המעקב / קישור תור האיסוף
  try {
    const res = await fetch(url, { method: 'GET', headers: { 'Accept-Language': 'he-IL,he;q=0.9' } });
    const html = await res.text();
    const isCollected = DELIVERED_KEYWORDS.some(keyword => html.includes(keyword));
    if (isCollected) {
      return {
        collected: true,
        statusSummary: 'בדיקת הקישור זיהתה שהמוצר כבר נלקח / נמסר — הוסר מהמערכת',
        checkedAt: nowStr
      };
    }
    return {
      collected: false,
      statusSummary: 'הקישור נבדק: החבילה עדיין פעילה וטרם נלקחה',
      checkedAt: nowStr
    };
  } catch (err) {
    return {
      collected: false,
      statusSummary: 'קישור שמור לבדיקה חוזרת בסנכרון הבא',
      checkedAt: nowStr
    };
  }
}
