import express from "express";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import cors from "cors";
import { GoogleAuth } from "google-auth-library";
import OpenAI from "openai";

// Load env variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// === Load Google Credentials ===
let credentials;
if (process.env.GOOGLE_CREDENTIALS_JSON) {
  credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
} else if (process.env.GOOGLE_CREDENTIALS_PATH) {
  const credFile = await readFile(process.env.GOOGLE_CREDENTIALS_PATH, "utf-8");
  credentials = JSON.parse(credFile);
} else {
  throw new Error("Google credentials not found in env");
}

const auth = new GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

// === OpenAI Setup ===
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// === System Prompt ===
const systemMessage = {
  role: "system",
  content: `Anda adalah asisten AI untuk membantu siswa yang mengambil mata pelajaran Informatika kelas X SMK. Materi yang dibahas antara lain:

1. Perangkat Keras Komputer
2. Perangkat Lunak Komputer
3. Pengguna
4. Mekanisme Kerja Internal pada Komputer
5. Interaksi antara Komputer dan Pengguna
6. Instalasi Sistem Operasi
7. Sejarah perkembangan sistem komputer
8. Pengertian sistem memori

Berikan jawaban detail dan jelas jika ada pertanyaan terkait itu. Jika pertanyaan di luar topik itu, beri tahu bahwa kamu adalah asisten AI yang dirancang untuk membantu belajar tentang topik-topik di atas dan arahkan agar pengguna bertanya ke topik tersebut.

Saat memberikan jawaban:
- Gunakan **Markdown**.
- Gunakan **paragraf** untuk penjelasan umum atau pengantar.
- Jika menjelaskan jenis-jenis atau langkah-langkah, gunakan **list bernomor (1., 2., 3., dst.)**.
- Gunakan **bold** untuk menyorot istilah penting.
- Hindari bullet (•) jika tidak dibutuhkan.

Contoh:

Jenis-jenis software adalah:

1. **Sistem Operasi**: Penjelasan.
2. **Aplikasi**: Penjelasan lanjutan.

Tambahkan paragraf sebelum atau sesudah jika diperlukan.`,
};

// === Home Check Route ===
app.get("/", (req, res) => {
  res.send("Chatbot webhook is running!");
});

// === Route untuk Dialogflow ===
app.post("/api/webhook", async (req, res) => {
  const userQuestion = req.body.queryResult.queryText;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [systemMessage, { role: "user", content: userQuestion }],
    });

    const aiResponse = chatCompletion.choices[0].message.content;
    res.json({ fulfillmentText: aiResponse });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.json({
      fulfillmentText: "Maaf, terjadi kesalahan dalam memproses permintaan.",
    });
  }
});

// === Route untuk Frontend (POST /api/message) ===
app.post("/api/message", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [systemMessage, { role: "user", content: userMessage }],
    });

    const aiResponse = chatCompletion.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.status(500).json({
      response: "Maaf, terjadi kesalahan dalam memproses permintaan.",
    });
  }
});

// === Start Server ===
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
