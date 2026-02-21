require('dotenv').config({ path: '.env.local' });
console.log(process.env.GEMINI_API_KEY ? "Key exists" : "Key missing");
