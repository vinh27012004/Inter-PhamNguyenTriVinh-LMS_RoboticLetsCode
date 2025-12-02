# 🚀 Frontend Setup Guide - E-Robotic Let's Code

## 📁 Cấu trúc dự án

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout với Navbar, Footer
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles với Tailwind
├── components/            # React components
│   └── Navbar.tsx         # Navigation bar
├── lib/                   # Utilities
│   └── axios.js           # Axios instance với interceptors
├── services/              # API services
│   └── robotics.js        # Backend API calls
├── public/                # Static files
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind CSS config
├── next.config.js         # Next.js config
├── .env.local             # Environment variables
└── .env.example           # Env template
```

---

## 📦 Cài đặt Dependencies

### Bước 1: Di chuyển vào thư mục frontend
```powershell
cd frontend
```

### Bước 2: Cài đặt packages
```powershell
npm install
```

**Packages được cài:**
- `next@14.2.0` - Next.js framework
- `react@18.3.0` - React library
- `axios@1.6.0` - HTTP client
- `lucide-react@0.344.0` - Icon library
- `js-cookie@3.0.5` - Cookie management
- `tailwindcss@3.4.0` - CSS framework
- `typescript@5.3.0` - TypeScript

---

## ⚙️ Cấu hình Environment Variables

File `.env.local` đã được tạo với:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

**Lưu ý:** Không commit `.env.local` lên Git (đã có trong `.gitignore`)

---

## 🛠️ Các tính năng đã triển khai

### 1. **Axios Instance (`lib/axios.js`)**

**Features:**
- ✅ Base URL từ environment variable
- ✅ Auto-attach Bearer token từ localStorage/Cookie
- ✅ Request interceptor: Tự động thêm Authorization header
- ✅ Response interceptor: Auto-refresh token khi 401
- ✅ Helper functions: `setTokens()`, `clearTokens()`, `isAuthenticated()`

**Usage:**
```javascript
import axiosInstance, { authHelpers } from '@/lib/axios';

// Gọi API
const data = await axiosInstance.get('/content/programs/');

// Quản lý tokens
authHelpers.setTokens(accessToken, refreshToken);
authHelpers.clearTokens();
const isLoggedIn = authHelpers.isAuthenticated();
```

---

### 2. **API Services (`services/robotics.js`)**

**Content API:**
- ✅ `getPrograms(params)` - List programs
- ✅ `getProgramDetail(id)` - Program detail với nested data
- ✅ `getSubcourses(params)` - List subcourses
- ✅ `getSubcourseDetail(id)` - Subcourse detail
- ✅ `getLessons(params)` - List lessons
- ✅ `getLessonDetail(id)` - Lesson detail
- ✅ `markLessonComplete(lessonId)` - Mark lesson complete
- ✅ `getUserProgress(params)` - User progress

**Auth API:**
- ✅ `getCurrentProfile()` - User profile
- ✅ `getAssignedModules(params)` - User assignments (quyền truy cập)
- ✅ `getMyPrograms()` - Program IDs có quyền
- ✅ `getMySubcourses()` - Subcourse IDs có quyền
- ✅ `getCurrentUser()` - Full user info
- ✅ `login(username, password)` - Login
- ✅ `logout()` - Logout

**Helper Functions:**
- ✅ `checkProgramAccess(programId)` - Kiểm tra quyền truy cập program
- ✅ `checkSubcourseAccess(subcourseId)` - Kiểm tra quyền truy cập subcourse

**Usage:**
```javascript
import { getPrograms, getLessonDetail, markLessonComplete } from '@/services/robotics';

// Lấy danh sách programs
const programs = await getPrograms();

// Lấy lesson detail
const lesson = await getLessonDetail(1);

// Đánh dấu hoàn thành
await markLessonComplete(1);
```

---

### 3. **Layout & Navbar (`app/layout.tsx`, `components/Navbar.tsx`)**

**Layout Features:**
- ✅ Root layout với font Inter (hỗ trợ tiếng Việt)
- ✅ Navbar sticky ở top
- ✅ Footer với copyright
- ✅ Metadata SEO-friendly

**Navbar Features:**
- ✅ Logo bên trái (gradient blue-purple)
- ✅ Menu items bên phải:
  - Trang chủ (/)
  - Khóa học của tôi (/my-courses)
- ✅ User menu: Profile, Logout
- ✅ Responsive - Mobile menu (hamburger)
- ✅ Icons từ Lucide React

---

### 4. **Tailwind CSS Configuration**

**Colors:**
- Primary: Blue palette (50-950)
- Secondary: Purple palette (50-900)
- Font: Inter (Google Fonts)

**Utilities:**
- Responsive breakpoints: sm, md, lg, xl
- Custom gradient backgrounds
- Hover effects, transitions

---

## 🚀 Chạy Development Server

```powershell
npm run dev
```

**Server sẽ chạy tại:** http://localhost:3000

**Pages có sẵn:**
- `/` - Home page (Hero, Features, CTA)
- `/my-courses` - Chưa implement (cần tạo)
- `/profile` - Chưa implement (cần tạo)

---

## 🔗 Integration với Backend

### Bước 1: Đảm bảo Backend đang chạy
```powershell
# Trong thư mục gốc (E-RoboticLet'sCode)
python manage.py runserver
# Backend chạy tại: http://127.0.0.1:8000
```

### Bước 2: Test API từ Frontend

**Trong React component:**
```tsx
'use client';

import { useEffect, useState } from 'react';
import { getPrograms } from '@/services/robotics';

export default function MyCoursesPage() {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await getPrograms();
        setPrograms(data);
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <div>
      {programs.map(program => (
        <div key={program.id}>{program.title}</div>
      ))}
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module 'next'"
**Solution:**
```powershell
cd frontend
npm install
```

### Lỗi CORS khi gọi API
**Solution:** Backend đã có `django-cors-headers` và cấu hình `CORS_ALLOWED_ORIGINS`

### Lỗi 401 Unauthorized
**Solution:** 
1. Login trước khi gọi API
2. Kiểm tra token đã được lưu: `authHelpers.isAuthenticated()`

### Tailwind CSS không hoạt động
**Solution:**
1. Kiểm tra `tailwind.config.js` có đúng content paths
2. Restart dev server: `npm run dev`

---

## 📝 Next Steps

### Pages cần implement:
- [ ] `/my-courses` - Danh sách khóa học của user
- [ ] `/courses/[id]` - Chi tiết khóa học
- [ ] `/lessons/[id]` - Chi tiết bài học
- [ ] `/profile` - Trang profile
- [ ] `/login` - Trang đăng nhập

### Features cần thêm:
- [ ] Authentication flow (Login/Logout)
- [ ] Protected routes (middleware)
- [ ] Loading states
- [ ] Error handling UI
- [ ] Toast notifications
- [ ] Progress tracking UI

---

## 📚 Resources

**Documentation:**
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Axios](https://axios-http.com/docs/intro)

**Backend API:**
- See `../API_ENDPOINTS.md` for full API reference
- Backend running at: http://127.0.0.1:8000/api/

---

## ✅ Summary

**✨ Đã hoàn thành:**
- ✅ Cấu trúc dự án Next.js với App Router
- ✅ Axios instance với auto Bearer token
- ✅ API services cho tất cả Backend endpoints
- ✅ Layout với Navbar responsive
- ✅ Tailwind CSS với font Inter
- ✅ Environment variables setup
- ✅ Home page với Hero & Features

**🎯 Ready to start:**
Frontend đã sẵn sàng để phát triển các pages tiếp theo!

**Run commands:**
```powershell
cd frontend
npm install    # Chỉ cần chạy 1 lần
npm run dev    # Start dev server
```

**Open:** http://localhost:3000

---

**Generated:** 2025-12-01  
**Status:** ✅ Setup Complete
