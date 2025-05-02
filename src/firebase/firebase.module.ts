import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { AuthFirebaseService } from './firebase.service';

const firebaseProvider = {
  provide: 'FIREBASE_APP',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const firebaseConfig = {
      type: configService.get<string>('TYPE'),
      project_id: configService.get<string>('PROJECT_ID'),
      private_key_id: configService.get<string>('PRIVATE_KEY_ID'),
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQDLhq33U9Iha0XE\nkvsM/CZ0PtIMzQJj0ifl3k/bQzTnsZbjRyozsJoAsrkBdscuh8k2HmmtrmluTBDN\nWL0bmk6GRedy35lPuqy/wn+/TqygtRjw7uyQ51ytLUVg1E+LvI0O7ViwrIVFjkHs\nkKiVHShxvu6B3ih3pVGBajC/+rqINJ6zxHkqkELOfRUj1sToQmGL69K5ljDdcYEY\nP4A2U/XaMBwjvMXvOpDk9/D532Sxk3PADpYNObYgF6TVLIbu7NaCxalMQei8GGxP\nm6+gwWk9rCJ2M79WaGobtEUt2hcQqxMUCpRtSxVxPXV02AhqivUbRkmnqFWHfUPm\ntaCCfAjpAgMBAAECgf976TQUaFgWY+L19B4LGQm3L0sZ9nZ37+RtxrbEmzNSVn2a\n/e3qin3xDjeTIicKC0HZzCDH7IS8J3XfFamE8weBSOlvLfw0ihPI/5ZnZJnS3Jjg\nrOLJ4U9IP4BQjM98PdSlVe7EWlK7i3rpVWRvDXb4FiSrDa/gdovPQzTOP37EbTeC\nNeHJq6IXVMlxbn31Y/0XepT7s6U6C659NBrou3N09NtoYo1wUwEaLIgE01G8wUPL\nYhTP40ycmMEKPIAnYjVbTDdwPiStcf7YmY0UjFOSKF6/nhXMUFKgy0AEcM6dYjmd\n6xSAV4QxxI7QUmD3GRSowQS1axoGx0zzivs3gJMCgYEA7RVECcotu8N+hOBJuoI6\nPqUXcQPr/HkABW/E31MzxIivB5Vh7sXQrPU34oMUGeBHPX2mTyXlYhl+a/SORRpb\n0kdCLkQTlld3SQMhuCq3hmQdQUoCoI6MgRdFbwDPt1VhoBONWspX+eQR+3s9AsRA\neLEO4JmOIV2Mp81W3B+ptacCgYEA28P34UDcwUeGBKpBeaMi9JsQ1F9KvtkZOU23\nSm0zTMeDdWa7pTLj2jrx8y+WIHTfQZ6uKJUWdPXKmDVEYON0jKUy0/EstnWNJ6td\n3eKr2OwU70VohH82oq5cvu6riCChIKn70hRCU3iDPih/OYxKG9+DTJLsmRyCvCcG\nMborPu8CgYBE50RR8A+gnW2c4q6q5QRWhpasgu5H/0axTc2S9lR6TxtHgfPneFhw\nnAg07dGev58U0PrPz/y9qRkj+PyMOt/q2kjyt1hV/m+tqZpYMxoJlfkmq4Ld9PAC\n6KeGXl8AMnFgG66eb2ZoOw+63hNaRX1TVmozfo1fRxgFANm4uf8RywKBgGxh1GD5\nvSVxIa4xTUMw6m9Z/k3OhS1kIiV5p3iELHWkO7ftp4NMesTIp0R45oAxQ124ZUnM\nZRvfkD/KnWNvKa6nVk7iNVvy01+KCyv/uyKrI5PxVh9qIcbPWRws1tm2xeA3FONB\nbIh/+bHxBPWbs3zVmYptN1Q3lF44nLxvhR5vAoGAO4nMPrcJRj9toAw5Fw+gB3XA\nU/eNsajoCvRW0NDAPITPTn/leljs1m5N4eU/idftIqS45lP+W/Z3K3n3KFz+rS1s\nin+pUmoLHP7GdZTYwyUD2Yqs5/Jxh3v3N7ql5O8U91V9pWeC4tFe+ACVBmPOI7va\nkAYPXee9q0W3phu94gY=\n-----END PRIVATE KEY-----\n',
      client_email: configService.get<string>('CLIENT_EMAIL'),
      client_id: configService.get<string>('CLIENT_ID'),
      auth_uri: configService.get<string>('AUTH_URI'),
      token_uri: configService.get<string>('TOKEN_URI'),
      auth_provider_x509_cert_url: configService.get<string>('AUTH_CERT_URL'),
      client_x509_cert_url: configService.get<string>('CLIENT_CERT_URL'),
      universe_domain: configService.get<string>('UNIVERSAL_DOMAIN'),
    } as admin.ServiceAccount;
  
    return admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
      storageBucket: `${firebaseConfig.projectId}.appspot.com`,
    });
  },
};

@Module({
  imports: [ConfigModule],
  providers: [firebaseProvider, AuthFirebaseService],
  exports: [AuthFirebaseService],
})
export class FirebaseModule {}