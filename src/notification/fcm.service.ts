import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor() {
    if (!admin.apps.length) {
      const serviceAccountPath =
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        path.resolve(__dirname, '../../config/unsub-9b2dd-firebase-adminsdk-fbsvc-eab1cce204.json');

      if (!fs.existsSync(serviceAccountPath)) {
        this.logger.error(
          `Firebase service account file not found at "${serviceAccountPath}". ` +
            'Set FIREBASE_SERVICE_ACCOUNT_PATH or create config/unsub-9b2dd-firebase-adminsdk-fbsvc-eab1cce204.json.',
        );
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require(serviceAccountPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    }
  }

  async sendToToken(token: string, title: string, body: string): Promise<void> {
    try {
      await admin.messaging().send({
        token,
        notification: {
          title,
          body,
        },
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to send FCM: ${error?.message ?? error}`);
    }
  }
}



