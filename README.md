# Instagram Clone with Next.js

A modern Instagram clone built with Next.js, Firebase, and TailwindCSS.

## Features

- 🔐 Google Authentication
- 📸 Create Posts
- 💭 Comment on Posts
- ❤️ Like Posts
- 🎭 Responsive Design
- 🚀 Real-time Updates

## Technologies Used

- Next.js 14
- Firebase 10
- TailwindCSS
- NextAuth.js
- Recoil
- Heroicons

## Getting Started

1. Clone the repository:

```bash
    git clone https://github.com/your-username/instagram-clone.git
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your environment variables (see `.env.example` for required variables)

4. Set up Firebase:

   - Create a new Firebase project
   - Enable Google Authentication
   - Create a Firestore Database
   - Update Firestore Rules
   - Add your Firebase config to `.env.local`

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Firebase Rules

Add these rules to your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read, write: if true;

      match /comments/{commentId} {
        allow read, write: if true;
      }

      match /likes/{likeId} {
        allow read, write: if true;
      }
    }
  }
}
```

## Environment Variables

See `.env.example` for required environment variables:

```plaintext
# Google Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
