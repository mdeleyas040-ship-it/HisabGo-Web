# Hisab Go (হিসাব গো) — ব্যাকআপ, রিস্টোর ও ক্লাউড সিঙ্ক ডকুমেন্টেশন

এই নথিতে Hisab Go অ্যাপ্লিকেশনের নিরাপদ JSON ব্যাকআপ, রিস্টোর সিস্টেম এবং Firebase Authentication ও Cloud Firestore সিঙ্ক্রোনাইজেশন প্রক্রিয়া বিস্তারিত বর্ণনা করা হলো।

---

## ১. ডাটা মডেল ও লোকাল স্টোরেজ (Persisted User Data Fields)

অ্যাপ্লিকেশনের সমস্ত তথ্য ব্রাউজারের লোকাল স্টোরেজে নিচের কি (Keys) অধীনে সংরক্ষিত থাকে:
1. `amar_hisab_transactions`: সমস্ত আয় ও ব্যয়ের তালিকা (`Transaction[]`)
2. `amar_hisab_bank_loans`: ব্যাংক ঋণ ও ইএমআই হিসাব (`BankLoan[]`)
3. `amar_hisab_personal_debts`: ব্যক্তিগত ধার ও পাওনা হিসাব (`PersonalPartyDebt[]`)
4. `amar_hisab_notifications`: নোটিফিকেশন হিস্ট্রি (`NotificationItem[]`)
5. `amar_hisab_monthly_budget`: ব্যবহারকারীর মাসিক খরচের বাজেট (`number`)

---

## ২. নিরাপদ JSON ব্যাকআপ ও রিস্টোর (Phase 1)

### ফাইল স্ট্রাকচার (Versioned Schema v1)
```json
{
  "metadata": {
    "appName": "Hisab Go",
    "appVersion": "1.2.0",
    "schemaVersion": 1,
    "exportedAt": "2026-10-09T18:30:00.000Z",
    "itemCounts": {
      "transactions": 14,
      "bankLoans": 2,
      "personalDebts": 3,
      "notifications": 4
    }
  },
  "data": {
    "transactions": [...],
    "bankLoans": [...],
    "personalDebts": [...],
    "notifications": [...],
    "monthlyBudget": 45000
  }
}
```

### সেফগার্ড ও রিস্টোর স্ট্র্যাটেজি
- **ফাইলের আকার সীমা:** সর্বোচ্চ ১০ মেগাবাইট (DoS ও ব্রাউজার ক্র্যাশ রোধে)।
- **ভ্যালিডেশন গার্ড:** স্কিমা ভার্সন, ফিল্ড টাইপ, প্রতিটি লেনদেনের আইডি, সংখ্যা ও ক্যাটাগরি কঠোরভাবে যাচাই করা হয়। কোনো ত্রুটি থাকলে রিস্টোর সাথে সাথে বাতিল হবে এবং বর্তমান তথ্যে কোনো পরিবর্তন আসবে না।
- **স্বয়ংক্রিয় স্ন্যাপশট (Rollback Safeguard):** যেকোনো রিস্টোর প্রয়োগের ঠিক পূর্বে বর্তমান লোকাল ডাটার একটি ব্যাকআপ স্ন্যাপশট তৈরি রাখা হয়, যাতে প্রয়োজন হলে এক ক্লিকেই পূর্বের অবস্থায় ফেরত যাওয়া যায়।
- **স্ট্র্যাটেজি অপশন:**
  1. **একত্রিত করুন (Merge):** আইডি অনুসারে ইউনিক মার্জ করা হয়; বর্তমান কোনো তথ্য মুছে যায় না।
  2. **সম্পূর্ণ প্রতিস্থাপন (Replace):** ব্যাকআপ ফাইলের ডাটা দিয়ে বর্তমান তথ্য প্রতিস্থাপন করা হয় (ব্যবহারকারীর স্পষ্ট নিশ্চিতকরণের পর)।

---

## ৩. গুগল ড্রাইভ স্ট্যাটাস (Phase 2)

- অ্যাপ্লিকেশনে গুগল ড্রাইভ আপলোডের জন্য কোনো ভুয়া সাকসেস মেসেজ বা কৃত্রিম সিমুলেশন রাখা হয়নি।
- গুগল ড্রাইভ ব্যবহারের জন্য Google Cloud Console-এ OAuth Client ID, ড্রাইভ স্কোপ (`https://www.googleapis.com/auth/drive.file`) এবং অথোরাইজড রিডাইরেক্ট ইউআরআই কনফিগারেশন প্রয়োজন।
- বর্তমানে ড্রাইভ ব্যাকআপ বাটনে ক্লিক করলে সিস্টেম স্বচ্ছভাবে ব্যবহারকারীকে নির্দেশ দেয় এবং অফলাইন JSON ব্যাকআপ ব্যবহারের বিকল্প প্রদর্শন করে।

---

## ৪. ফায়ারবেস ক্লাউড সিঙ্ক ও সিকিউরিটি রুলস (Phase 3)

### ফায়ারবেস কনসোল সেটআপ ধাপ:
1. **Firebase Console** (console.firebase.google.com)-এ নতুন প্রজেক্ট তৈরি করুন বা বিদ্যমান প্রজেক্ট বেছে নিন।
2. **Authentication:** Sign-in method ট্যাবে গিয়ে "Google" সক্রিয় করুন। Authorized domains-এ আপনার হোস্টিং বা ডেভেলপমেন্ট ডোমেইন যোগ করুন।
3. **Firestore Database:** Cloud Firestore ডেটাবেস সক্রিয় করুন।
4. **Environment Variables:** আপনার প্রজেক্টের `.env` ফাইলে নিচের ভ্যারিয়েবলগুলো দিন:
   ```env
   VITE_FIREBASE_API_KEY="AIzaSy..."
   VITE_FIREBASE_AUTH_DOMAIN="hisabgo.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="hisabgo-app"
   VITE_FIREBASE_STORAGE_BUCKET="hisabgo.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
   VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
   ```

### ফায়ারস্টোর সিকিউরিটি রুলস (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{subcollection=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```
**নিরাপত্তা নিশ্চয়তা:** একজন ব্যবহারকারী কখনো অন্য কোনো ব্যবহারকারীর ডাটা পড়তে বা পরিবর্তন করতে পারবে না (`request.auth.uid == userId`)।
