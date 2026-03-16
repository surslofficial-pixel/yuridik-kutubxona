import 'dotenv/config';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Faqat POST so\'rov qabul qilinadi' });
    }

    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Xabar kiritilmagan' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!geminiKey && !groqKey) {
        console.error('API kalitlari topilmadi. .env faylini tekshiring.');
        return res.status(500).json({ error: 'API kalitlar sozlanmagan' });
    }

    const systemInstruction = `Sen "AI Kutubxonachi" — Surxondaryo yuridik texnikumi kutubxonasining professional sun'iy intellektli yordamchisisan.

🎯 ASOSIY VAZIFANG:
- Foydalanuvchilarga kitoblar haqida batafsil ma'lumot berish
- Kitobning muallifi, yozilgan yili, janri, sahifalar soni haqida aniq ma'lumot berish
- Kitobning MAZMUNI va QISQACHA TAVSIFI (synopsis) haqida batafsil aytib berish
- Agar platformada yo'q kitob so'ralsa ham, u haqida to'liq ma'lumot topib berish
- Kitob tavsiyalar berish (masalan: "Siz ... o'qigan bo'lsangiz, ... ni ham o'qing")
- O'zbek va jahon adabiyotidagi eng yaxshi kitoblarni tavsiya qilish

🚫 QATIY QOIDALAR:
- FAQAT kitoblar, adabiyot, mualliflar va kutubxona bilan bog'liq savollarga javob ber
- Agar foydalanuvchi kitobga aloqador BO'LMAGAN savol bersa (masalan: ob-havo, sport, siyosat, shaxsiy savollar, matematika, dasturlash va boshqa mavzular), QATIY ravishda javob BERMA va shu javobni qaytar:
  "📚 Kechirasiz, men faqat kitoblar va adabiyot bo'yicha yordam bera olaman. Iltimos, kitob yoki muallif haqida savol bering!"
- Hech qachon o'zingni boshqa AI deb tanishma
- Hech qachon nojo'ya yoki zararli kontent berma

📝 JAVOB FORMATI:
- Javoblaringni doim O'zbek tilida ber
- Kitob haqida so'ralganda quyidagi formatda javob ber:
  📖 Kitob nomi: ...
  ✍️ Muallif: ...
  📅 Yozilgan yili: ...
  📄 Sahifalar: ...
  🏷️ Janr: ...
  📝 Qisqacha mazmuni: ...
  ⭐ Tavsiya: ...
- Javoblarni chiroyli, tartibli va tushunarli qilib yoz
- Emoji ishlatib, javobni ko'rgazmali qil
- Qisqa, aniq va foydali bo'lsin`;

    // Gemini orqali javob olish
    async function tryGemini() {
        const contents = [];
        if (history && Array.isArray(history)) {
            const recentHistory = history.slice(-10);
            for (const msg of recentHistory) {
                if (msg.role === 'user' || msg.role === 'assistant') {
                    contents.push({
                        role: msg.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: msg.content }]
                    });
                }
            }
        }
        contents.push({ role: 'user', parts: [{ text: message }] });

        console.log('Gemini so\'rov yuborilmoqda (gemini-2.5-flash)...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            console.error('Gemini API xatosi:', JSON.stringify(err));
            throw new Error('Gemini error');
        }
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }

    // Groq orqali javob olish
    async function tryGroq() {
        const messages = [{ role: 'system', content: systemInstruction }];
        if (history && Array.isArray(history)) {
            const recentHistory = history.slice(-10);
            for (const msg of recentHistory) {
                if (msg.role === 'user' || msg.role === 'assistant') {
                    messages.push({ role: msg.role, content: msg.content });
                }
            }
        }
        messages.push({ role: 'user', content: message });

        console.log('Groq so\'rov yuborilmoqda (llama-3.3-70b-versatile)...');
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages,
                temperature: 0.7,
                max_tokens: 2048
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            console.error('Groq API xatosi:', JSON.stringify(err));
            throw new Error('Groq error');
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    }

    try {
        console.log('--- Chat handler boshlandi ---');
        console.log('Muhit:', { hasGemini: !!geminiKey, hasGroq: !!groqKey });

        const useGeminiFirst = Math.random() > 0.5;
        let reply = null;

        if (useGeminiFirst && geminiKey) {
            try { reply = await tryGemini(); } catch (e) { console.warn('Gemini muvaffaqiyatsiz, Groq-ga o\'tilmoqda...'); }
            if (!reply && groqKey) {
                try { reply = await tryGroq(); } catch (e) { console.error('Groq ham muvaffaqiyatsiz.'); }
            }
        } else if (groqKey) {
            try { reply = await tryGroq(); } catch (e) { console.warn('Groq muvaffaqiyatsiz, Gemini-ga o\'tilmoqda...'); }
            if (!reply && geminiKey) {
                try { reply = await tryGemini(); } catch (e) { console.error('Gemini ham muvaffaqiyatsiz.'); }
            }
        } else if (geminiKey) {
            try { reply = await tryGemini(); } catch (e) { console.error('Gemini muvaffaqiyatsiz.'); }
        }

        if (!reply) {
            return res.status(500).json({ error: 'Hozir javob olishda muammo bor. Iltimos qayta urinib ko\'ring.' });
        }

        return res.status(200).json({ reply });
    } catch (error) {
        console.error('Server xatolik:', error);
        return res.status(500).json({ error: 'Serverda xatolik yuz berdi. Qayta urinib ko\'ring.' });
    }
}
