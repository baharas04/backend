import express from "express";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import cors from "cors";
import { GoogleAuth } from "google-auth-library";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const credentials = JSON.parse(
  await readFile("./src/dialogflow-credentials.json", "utf8")
);

const auth = new GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Jangan disimpan langsung dalam kode
});

const systemMessage = {
  role: "system",
  content:
    "Anda adalah asisten AI untuk membantu siswa yang mengambil mata pelajaran Informatika kelas X SMK. Materi yang dibahas antara lain:1.Perangkat Keras Komputer, 2.Perangkat Lunak Komputer, 3.Pengguna, 4.Mekanisme Kerja Internal pada Komputer, 5.Interaksi antara Komputer dan Pengguna, 6.Instalasi Sistem Operasi, 7.Sejarah perkembangan sistem komputer, 8.Pengertian sistem memori. Berikan jawaban detail dan jelas jika ada pertanyaan terkait itu. Jika pertanyaan di luar topik itu, beri tahu bahwa kau adalah asisten AI yang dirancang untuk membantu belajar tentang: Berpikir komputasional, Teknologi Informasi dan Komunikasi, Sistem Komputer, Jaringan Komputer dan Internet, Analisis Data, Algoritma dan pemograman, Dampak Sosial Informatika, Praktik Lintas Bidang dan arahakan agar pengguna bertanya ke topik terkait itu",
};

app.get("/", (req, res) => {
  res.send("Chatbot webhook is running!");
});

app.post("/api/webhook", async (req, res) => {
  const userQuestion = req.body.queryResult.queryText;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [systemMessage, { role: "user", content: userQuestion }],
    });

    const aiResponse = chatCompletion.choices[0].message.content;

    res.json({
      fulfillmentText: aiResponse,
    });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.json({
      fulfillmentText: "Maaf, terjadi kesalahan dalam memproses permintaan.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
