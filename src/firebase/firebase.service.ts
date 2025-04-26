import { Inject, Injectable } from '@nestjs/common';
import { app, auth } from 'firebase-admin';

@Injectable()
export class AuthFirebaseService {
  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {}

  async createUser(params: auth.CreateRequest) {
    return this.firebaseApp.auth().createUser(params);
  }

  async getUserByEmail(email: string) {
    return this.firebaseApp.auth().getUserByEmail(email);
  }

  async revokeRefreshTokens(uid: string) {
    return this.firebaseApp.auth().revokeRefreshTokens(uid);
  }

  async verifyIdToken(idToken: string) {
    return this.firebaseApp.auth().verifyIdToken(idToken);
  }
}
