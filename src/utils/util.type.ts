/* eslint-disable @typescript-eslint/no-explicit-any */
import { AES, enc } from 'crypto-js';

const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY || '';

export type WebSocketClientProps = {
  onConnectionId: (id: string) => void;
  connectionId: string | null;
};

export type AuthProps = {
  connectionId: string | null;
};

export type Step = 'signup' | 'popup' | 'confirm' | 'login' | 'home' | 'submit';

export type Values = {
  email: string;
  username: string;
  password: string;
  name: string;
  preferred_username: string;
  confirmationCode: string | undefined;
  score?: string;
  signupError?: string;
  loginError?: string;
  submitError?: string;
  confirmError?: string;
  deleteError?: string;
  fetchScoresError?: string;
  fetchHighestScoreError?: string;
};

export type LeaderboardItem = { user_name: string; score: number; id?: string };

export interface LeaderboardResponse {
  data: LeaderboardItem[];
  count: number;
  lastKey?: string;
}

export interface LoginResponse {
  data: {
    user: string;
    user_id: string;
    username: string;
    // AccessToken: string;
    // ExpiresIn: number;
    // IdToken: string;
    // RefreshToken: string;
    // TokenType: string;
  };
}

export interface SubmitScoreResponse {
  id: string;
  score: number;
  timestamp: number;
}

export interface CognitoIdToken {
  sub: string;
  email: string;
  'cognito:username': string;
}

export const decrypt = (data: string) => {
  try {
    const bytes = AES.decrypt(data, encryptionKey);
    const decrypted = bytes.toString(enc.Utf8);
    if (!decrypted) throw new Error('Decryption failed (empty string)');
    return JSON.parse(decrypted);
  } catch (err) {
    console.error('Decryption error:', encryptionKey.length, err);
    return null;
  }
};

export const encryptData = <T>(rawData: T): string => {
  let data: any = rawData;
  if (typeof rawData !== 'string') {
    data = JSON.stringify(rawData);
  }
  return AES.encrypt(data, encryptionKey).toString();
};

export const decryptData = (encryptedData: string): string =>
  AES.decrypt(encryptedData, encryptionKey).toString(enc.Utf8);
