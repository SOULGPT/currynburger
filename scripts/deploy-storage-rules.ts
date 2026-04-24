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

async function deployStorageRules() {
  try {
    const rulesPath = path.join(process.cwd(), 'storage.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');

    console.log(`Deploying Storage rules to ${projectId}...`);
    
    const securityRules = admin.securityRules(adminApp);
    
    const ruleset = await securityRules.createRuleset({
      name: 'storage.rules',
      content: rulesContent,
    });
    
    // Release the ruleset to the 'firebase.storage' service
    // Note: You must specify the bucket or use the default
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;
    await securityRules.releaseStorageRuleset(ruleset.name, bucketName);
    
    console.log('✅ Storage rules deployed successfully!');
  } catch (error) {
    console.error('❌ Error deploying storage rules:', error);
    process.exit(1);
  }
}

deployStorageRules();
