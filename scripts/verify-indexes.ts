import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase Admin credentials in .env.local');
  process.exit(1);
}

const adminApp = admin.apps.length > 0 ? admin.app() : admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

async function deployIndexes() {
  try {
    const indexesPath = path.join(process.cwd(), 'firestore.indexes.json');
    const indexesContent = JSON.parse(fs.readFileSync(indexesPath, 'utf8'));

    console.log(`Note: The Firebase Admin SDK does not support direct index deployment via 'securityRules'.`);
    console.log(`Indexes must be deployed via the Firebase Management API or CLI.`);
    console.log(`However, I will verify the index file structure...`);
    
    if (indexesContent.indexes) {
      console.log(`✅ Index file contains ${indexesContent.indexes.length} indexes.`);
    }

    console.log(`Since 'firebase-tools' is not globally available, please run:`);
    console.log(`npx firebase-tools deploy --only firestore:indexes --project ${projectId}`);
    
  } catch (error) {
    console.error('❌ Error reading indexes:', error);
    process.exit(1);
  }
}

deployIndexes();
