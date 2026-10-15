// api/check-subscription.js
// وسيط للتحقق من اشتراك المستخدم في قناة تيليجرام

export default async function handler(req, res) {
  // السماح بالطلبات من أي مصدر
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  // معالجة طلبات OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // استقبال المعاملات
  const { userId, channelId } = req.query;

  // التحقق من وجود المعاملات
  if (!userId || !channelId) {
    return res.status(400).json({ 
      error: 'Missing parameters',
      isSubscribed: false 
    });
  }

  // قراءة التوكن من متغيرات البيئة (آمن)
  const BOT_TOKEN = process.env.BOT_TOKEN;
  
  if (!BOT_TOKEN) {
    return res.status(500).json({ 
      error: 'Server misconfigured',
      isSubscribed: false 
    });
  }

  try {
    // استدعاء Telegram API
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${channelId}&user_id=${userId}`;
    const response = await fetch(url);
    const data = await response.json();

    // معالجة النتيجة
    if (data.ok && data.result) {
      const status = data.result.status;
      const isSubscribed = ['creator', 'administrator', 'member'].includes(status);
      return res.status(200).json({ isSubscribed });
    } else {
      return res.status(200).json({ isSubscribed: false });
    }
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to verify',
      isSubscribed: false 
    });
  }
}
