# Instagram Clone with Next.js

Bu proje, modern web teknolojileri kullanılarak geliştirilmiş bir Instagram klonudur. Next.js, Firebase, Tailwind CSS ve diğer güçlü teknolojiler kullanılarak oluşturulmuştur.

## Özellikler

- 🔐 Google ile Kimlik Doğrulama
- 📸 Post Paylaşma
- ❤️ Post Beğenme
- 💬 Yorum Yapma
- 👤 Profil Sayfası
  - Profil Düzenleme
  - Bio Ekleme/Düzenleme
  - Post Grid Görünümü
  - Post İstatistikleri (Beğeni ve Yorum Sayıları)
- 🎨 Instagram Benzeri UI/UX
- 🔄 Gerçek Zamanlı Güncellemeler
- 😊 Emoji Desteği
- 📱 Responsive Tasarım

## Teknolojiler

- Next.js 14
- Firebase v9
- NextAuth.js
- Recoil
- Tailwind CSS
- Heroicons
- Headless UI
- React Moment
- Emoji Picker React

## Kurulum

1. Projeyi klonlayın:

```bash
git clone https://github.com/[kullanıcı-adı]/InstagramClone-w-NextJs.git
```

2. Proje dizinine gidin:

```bash
cd InstagramClone-w-NextJs
```

3. Bağımlılıkları yükleyin:

```bash
npm install
```

4. `.env.local` dosyası oluşturun ve gerekli environment variable'ları ekleyin:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

5. Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

## Firebase Ayarları

1. Firebase Console'da yeni bir proje oluşturun
2. Authentication'da Google sign-in'i etkinleştirin
3. Firestore Database'i oluşturun
4. Storage'ı etkinleştirin
5. Firestore kurallarını güncelleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Katkıda Bulunma

1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## İletişim

Proje Linki: [https://github.com/[kullanıcı-adı]/InstagramClone-w-NextJs](https://github.com/[kullanıcı-adı]/InstagramClone-w-NextJs)
