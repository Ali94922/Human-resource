import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Setup JSON body parsing with higher limit for image uploads
app.use(express.json({ limit: "15mb" }));

// Initialize Google Gemini API Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// JSON Schema for Egyptian National ID extraction
const nationalIdSchema = {
  type: Type.OBJECT,
  properties: {
    fullName: {
      type: Type.STRING,
      description: "الاسم الكامل المكتوب في البطاقة الشخصية باللغة العربية بوضوح ودقة."
    },
    nationalId: {
      type: Type.STRING,
      description: "الرقم القومي المكون من 14 رقماً بالضبط وبدون مسافات."
    },
    address: {
      type: Type.STRING,
      description: "العنوان بالتفصيل المكتوب في البطاقة الشخصية."
    },
    jobTitle: {
      type: Type.STRING,
      description: "المهنة أو الوظيفة المذكورة في البطاقة الشخصية (مثال: عامل، طالب، مهندس، بدون عمل...)."
    },
    dateOfBirth: {
      type: Type.STRING,
      description: "تاريخ الميلاد بتنسيق YYYY-MM-DD المستخلص من الرقم القومي أو المكتوب."
    },
    governorate: {
      type: Type.STRING,
      description: "محافظة الميلاد المستخلصة من كود المحافظة في الرقم القومي أو مكان الميلاد."
    },
    gender: {
      type: Type.STRING,
      description: "النوع، ويجب أن يكون إما 'ذكر' أو 'أنثى'."
    },
    cardIssueDate: {
      type: Type.STRING,
      description: "رقم الصادر أو تاريخ صدور البطاقة المكتوب في ظهر البطاقة (مثل 2/2026 أو 12/2023 أو 02/2026). إذا لم تجده اكتب 'غير متوفر'."
    }
  },
  required: ["fullName", "nationalId", "address", "jobTitle", "dateOfBirth", "governorate", "gender", "cardIssueDate"]
};

// Map of Egyptian Governorates code from National ID
const GOVERNORATES_MAP: Record<string, string> = {
  "01": "القاهرة",
  "02": "الإسكندرية",
  "03": "بورسعيد",
  "04": "السويس",
  "11": "دمياط",
  "12": "الدقهلية",
  "13": "الشرقية",
  "14": "القليوبية",
  "15": "كفر الشيخ",
  "16": "الغربية",
  "17": "المنوفية",
  "18": "البحيرة",
  "19": "الإسماعيلية",
  "21": "الجيزة",
  "22": "بني سويف",
  "23": "الفيوم",
  "24": "المنيا",
  "25": "أسيوط",
  "26": "سوهاج",
  "27": "قنا",
  "28": "أسوان",
  "29": "الأقصر",
  "31": "البحر الأحمر",
  "32": "الوادي الجديد",
  "33": "مطروح",
  "34": "شمال سيناء",
  "35": "جنوب سيناء",
  "88": "خارج جمهورية مصر العربية"
};

// Helper function to convert Eastern Arabic numerals to standard Western numerals
function convertArabicNumerals(str: string): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  let result = str || "";
  for (let i = 0; i < arabicDigits.length; i++) {
    const reg = new RegExp(arabicDigits[i], "g");
    result = result.replace(reg, String(i));
  }
  return result;
}

// Helper function to decode Egyptian National ID
function decodeEgyptianNationalId(idStr: string) {
  let cleanId = idStr || "";
  cleanId = convertArabicNumerals(cleanId);
  cleanId = cleanId.replace(/\D/g, ""); // strip non-numeric characters

  if (cleanId.length !== 14) {
    return null;
  }

  const centuryCode = cleanId.charAt(0);
  const yearDigits = cleanId.substring(1, 3);
  const monthDigits = cleanId.substring(3, 5);
  const dayDigits = cleanId.substring(5, 7);
  const govCode = cleanId.substring(7, 9);
  const genderCode = cleanId.charAt(12);

  // Century: 2 means 1900-1999, 3 means 2000-2099
  const century = centuryCode === "2" ? "19" : centuryCode === "3" ? "20" : null;
  if (!century) return null;

  const birthYear = century + yearDigits;
  const birthMonth = monthDigits;
  const birthDay = dayDigits;
  const dateOfBirth = `${birthYear}-${birthMonth}-${birthDay}`;

  const governorate = GOVERNORATES_MAP[govCode] || "غير معروفة";
  const gender = parseInt(genderCode, 10) % 2 === 0 ? "أنثى" : "ذكر";

  return {
    dateOfBirth,
    governorate,
    gender,
    cleanId
  };
}

// Endpoint to parse Egyptian National ID from image
app.post("/api/id-card/parse", async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image || !mimeType) {
      return res.status(400).json({ error: "خطأ: لم يتم إرسال الصورة أو نوع الصورة بشكل صحيح" });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: image,
      },
    };

    const prompt = `أنت خبير ذكاء اصطناعي متخصص في قراءة وتدقيق بطاقات الرقم القومي المصرية (البطاقة الشخصية وجه وظهر).
قم بتحليل الصورة المرفقة واستخراج البيانات بدقة عالية جداً.

توجيهات هامة جداً لضمان الدقة:
1. الاسم الكامل (fullName): استخرج الاسم رباعي أو خماسي كما هو مكتوب بوضوح باللغة العربية. تأكد من تهجئة الحروف بشكل صحيح.
2. الرقم القومي (nationalId): استخرج الرقم القومي المكون من 14 رقماً بالضبط. اكتب الأرقام باللغة الإنجليزية/الغربية (مثال: 29408151203487).
3. العنوان (address): استخرج العنوان بالتفصيل كما هو مكتوب في البطاقة. إذا لم يكن العنوان موجوداً أو كان غير واضح، اكتب "غير متوفر".
4. الوظيفة (jobTitle): استخرج الوظيفة/المهنة المكتوبة أسفل العنوان أو في ظهر البطاقة (مثل: عامل، طالب، سائق، مهندس، بدون عمل، إلخ). إذا لم تكن الوظيفة موجودة في الصورة (لأنها على الوجه الآخر للبطاقة مثلاً)، اكتب "غير متوفر".
5. تاريخ الميلاد (dateOfBirth)، محافظة الميلاد (governorate)، والنوع (gender): استخرجهم بدقة.
6. رقم الصادر أو تاريخ الصدور (cardIssueDate): استخرج رقم الصادر أو تاريخ الصدور المكتوب في ظهر البطاقة الشخصية، وغالباً ما يكون على شكل شهر/سنة (مثل: 2/2026 أو 12/2023 أو 02/2026) وهو المكتوب بجوار الباركود أو في منتصف الظهر للبطاقة. إذا كانت الصورة المرفوعة للوجه الأمامي فقط أو لم تجد رقم الصادر، اكتب "غير متوفر".

- إذا كانت صورة البطاقة المرفوعة تحتوي على وجه واحد فقط أو كانت بعض البيانات غير ظاهرة، يرجى ملء الحقول غير الظاهرة بـ "غير متوفر" وعدم تركها فارغة أو الفشل في توليد الـ JSON.

يجب أن تكون النتيجة بتنسيق JSON نظيف وصحيح تماماً ومطابق للمخطط المطلوب.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite", // Fast, free, stable, and highly accurate for visual and complex parsing
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: nationalIdSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("لم يتم إرجاع استجابة نصية من نموذج الذكاء الاصطناعي");
    }

    // Strip any potential markdown block backticks if present
    let cleanJson = resultText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/i, "");
      cleanJson = cleanJson.replace(/\n?```$/, "");
    }
    cleanJson = cleanJson.trim();

    const extractedData = JSON.parse(cleanJson);

    // Double check and fix decoding if Gemini made any minor mistake decoding the birth details from the ID
    const decoded = decodeEgyptianNationalId(extractedData.nationalId);
    if (decoded) {
      extractedData.nationalId = decoded.cleanId; // Use standard digits
      extractedData.dateOfBirth = decoded.dateOfBirth;
      extractedData.governorate = decoded.governorate;
      extractedData.gender = decoded.gender;
    } else {
      // Clean up nationalId anyway if possible
      let cleanId = convertArabicNumerals(extractedData.nationalId || "");
      cleanId = cleanId.replace(/\D/g, "");
      extractedData.nationalId = cleanId;
    }

    res.json({ success: true, data: extractedData });
  } catch (error: any) {
    console.error("ID parsing error:", error);
    res.status(500).json({ error: error.message || "فشل استخراج البيانات من بطاقة الرقم القومي" });
  }
});

// Endpoint to decode 14-digit National ID directly (very fast, no AI cost)
app.post("/api/id-card/decode-number", (req, res) => {
  try {
    const { nationalId } = req.body;
    if (!nationalId || nationalId.length !== 14) {
      return res.status(400).json({ error: "الرقم القومي يجب أن يتكون من 14 رقماً بالضبط" });
    }

    const decoded = decodeEgyptianNationalId(nationalId);
    if (!decoded) {
      return res.status(400).json({ error: "الرقم القومي غير صالح أو غير معترف بترميزه" });
    }

    res.json({ success: true, data: decoded });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "حدث خطأ أثناء فك ترميز الرقم القومي" });
  }
});

// JSON Schema for WhatsApp / Permit workers extraction
const permitsTextSchema = {
  type: Type.OBJECT,
  properties: {
    people: {
      type: Type.ARRAY,
      description: "قائمة الأشخاص المستخلصين من النص المنسوخ من واتساب أو كشوفات العمل.",
      items: {
        type: Type.OBJECT,
        properties: {
          fullName: {
            type: Type.STRING,
            description: "الاسم الكامل المكتوب في النص (يفضل ثلاثي أو رباعي)."
          },
          nationalId: {
            type: Type.STRING,
            description: "الرقم القومي المكون من 14 رقماً بالضبط. اكتب الأرقام باللغة الإنجليزية."
          },
          governorate: {
            type: Type.STRING,
            description: "المحافظة المذكورة أو التي ينتمي إليها الشخص. اكتب 'غير محدد' إذا لم تذكر."
          },
          jobTitle: {
            type: Type.STRING,
            description: "المهنة أو الوظيفة المذكورة (مثل: نجار، حداد، سائق، عامل). اكتب 'عامل' كقيمة افتراضية إذا لم تذكر."
          }
        },
        required: ["fullName", "nationalId", "governorate", "jobTitle"]
      }
    }
  },
  required: ["people"]
};

// Endpoint to parse text copied from WhatsApp/messages for permits
app.post("/api/permits/parse-text", async (req, res) => {
  try {
    const { textContent } = req.body;
    if (!textContent) {
      return res.status(400).json({ error: "خطأ: لم يتم إرسال النص المراد تحليله" });
    }

    const prompt = `أنت مساعد ذكاء اصطناعي متخصص في استخراج كشوفات عمال المقاولات من الرسائل العشوائية والمنسوخة من تطبيق واتساب (WhatsApp).
قم بتحليل النص المرفق واستخراج قائمة الأشخاص والعمال منه بدقة عالية جداً.

توجيهات هامة جداً:
1. الاسم الكامل (fullName): استخرج الاسم رباعي أو ثلاثي كما هو وارد.
2. الرقم القومي (nationalId): استخرج الرقم القومي المكون من 14 رقماً بالضبط. قم بتحويل أي أرقام عربية أو هندية إلى أرقام إنجليزية (غربية) قياسية بدون مسافات.
3. المحافظة (governorate): استخرج المحافظة المذكورة. إذا لم تكن مذكورة صراحة، اكتب "غير محدد" وسيقوم النظام بفكها برمجياً من الرقم القومي.
4. المهنة (jobTitle): استخرج المهنة المذكورة بجوار الاسم (مثل: نجار، حداد، سائق، بناء، إلخ). إذا لم تذكر، ضع "عامل" كقيمة افتراضية.

تأكد من إرجاع قائمة نظيفة ومكتملة بجميع الأسماء والبطاقات الواردة بالنص في حقل "people".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: { parts: [{ text: textContent }, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: permitsTextSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("لم يتم إرجاع استجابة نصية من نموذج الذكاء الاصطناعي");
    }

    // Clean JSON markdown block
    let cleanJson = resultText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/i, "");
      cleanJson = cleanJson.replace(/\n?```$/, "");
    }
    cleanJson = cleanJson.trim();

    const extractedData = JSON.parse(cleanJson);
    const people = extractedData.people || [];

    // Post-process to auto-decode national IDs for perfect accuracy
    const processedPeople = people.map((person: any) => {
      // Clean nationalId digits
      let cleanId = convertArabicNumerals(person.nationalId || "");
      cleanId = cleanId.replace(/\D/g, "");
      person.nationalId = cleanId;

      const decoded = decodeEgyptianNationalId(cleanId);
      if (decoded) {
        // If governorate was "غير محدد" or "غير معروفة", enrich it!
        if (!person.governorate || person.governorate === "غير محدد" || person.governorate === "غير معروفة") {
          person.governorate = decoded.governorate;
        }
      }
      return person;
    });

    res.json({ success: true, data: processedPeople });
  } catch (error: any) {
    console.error("Permits text parsing error:", error);
    res.status(500).json({ error: error.message || "فشل استخراج كشف البطاقات من النص" });
  }
});

// Endpoint to parse contract forms (from images or text) into standard templates with placeholders using Gemini
app.post("/api/template/parse-form", async (req, res) => {
  try {
    const { image, mimeType, textContent } = req.body;
    
    let contentParts: any[] = [];
    if (image && mimeType) {
      contentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: image,
        },
      });
    } else if (textContent) {
      contentParts.push({ text: textContent });
    } else {
      return res.status(400).json({ error: "خطأ: لم يتم إرسال نص أو صورة النموذج" });
    }

    const prompt = `أنت خبير صياغة عقود وقوالب قانونية باللغة العربية.
مهمتك هي أخذ النص أو الصورة المرفقة لعقد عمل، وتحويلها إلى قالب عقد مرن يحتوي على الكلمات المفتاحية (Placeholders) التالية مستبدلة بالبيانات المتغيرة المناسبة:
- {{الاسم_الكامل}} : لاسم الموظف أو العامل
- {{الرقم_القومي}} : للرقم القومي المصري المكون من 14 رقماً
- {{العنوان}} : لعنوان إقامة العامل
- {{الوظيفة}} : للمسمى الوظيفي أو المهنة
- {{تاريخ_الميلاد}} : لتاريخ ميلاد العامل
- {{المحافظة}} : لمحافظة ميلاد أو إقامة العامل
- {{النوع}} : للنوع (ذكر أو أنثى)
- {{الأجر}} : للأجر اليومي للعامل اليومية (إذا كان العقد يومية)
- {{الراتب_الشهري}} : للراتب الشهري للموظف الثابت (إذا كان العقد ثابتاً)
- {{ساعات_العمل}} : لعدد ساعات العمل اليومية
- {{تاريخ_البداية}} : لتاريخ مباشرة أو بداية العقد
- {{تاريخ_النهاية}} : لتاريخ انتهاء العقد (إن وجد)
- {{اسم_الشركة}} : لاسم الشركة أو صاحب العمل (الطرف الأول)

يرجى صياغة العقد وإرجاعه كاملاً باللغة العربية بنسق واضح ومرتب، مع الحفاظ على صياغته الأصلية الدقيقة واستبدال كافة الأسماء والأرقام والتواريخ والأجور المتغيرة بالكلمات المفتاحية المذكورة أعلاه بالضبط.
أعد الناتج كـ JSON يحتوي على حقل واحد فقط يسمى "templateText".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite", // Fast, free, stable, and highly accurate for complex formatting and text transformation
      contents: { parts: [...contentParts, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            templateText: {
              type: Type.STRING,
              description: "نص القالب المولد بالكامل متضمناً الكلمات المفتاحية المحددة."
            }
          },
          required: ["templateText"]
        }
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("لم يتم إرجاع استجابة نصية من نموذج الذكاء الاصطناعي");
    }

    const extractedData = JSON.parse(resultText);
    res.json({ success: true, data: extractedData });
  } catch (error: any) {
    console.error("Template parsing error:", error);
    res.status(500).json({ error: error.message || "فشل معالجة وتوليد قالب العقد" });
  }
});

// Configure Vite or Static Asset Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully running on http://localhost:${PORT}`);
  });
}

startServer();
