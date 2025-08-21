import admin from "firebase-admin";

let serviceAccount;

if (process.env.GOOGLE_CREDENTIALS_BASE64) {
  // Decodificamos el string base64 y lo parseamos a objeto JSON
  const decoded = Buffer.from(
    process.env.GOOGLE_CREDENTIALS_BASE64,
    "base64"
  ).toString("utf-8");

  serviceAccount = JSON.parse(decoded);
} else {
  throw new Error("⚠️ Falta la variable de entorno GOOGLE_CREDENTIALS_BASE64");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID, // opcional
  });

  if (process.env.NODE_ENV === "development") {
    const firestore = admin.firestore();

    firestore.settings({
      host: "127.0.0.1",
      port: 8080,
      ssl: false,
    });
  }
}

export default admin;
export const db = admin.firestore();
export const auth = admin.auth();
