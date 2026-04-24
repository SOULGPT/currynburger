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

async function deployRules() {
  try {
    const rulesPath = path.join(process.cwd(), 'firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');

    console.log(`Deploying Firestore rules to ${projectId}...`);
    
    const securityRules = admin.securityRules(adminApp);
    
    // The createRuleset method in firebase-admin takes a RulesFile directly
    const ruleset = await securityRules.createRuleset({
      name: 'firestore.rules',
      content: rulesContent,
    });
    
    // Release the ruleset to the 'cloud.firestore' service
    await securityRules.releaseFirestoreRuleset(ruleset.name);
    
    console.log('✅ Firestore rules deployed successfully!');
  } catch (error) {
    console.error('❌ Error deploying rules:', error);
    process.exit(1);
  }
}

deployRules();
