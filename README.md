# Calicut Watches

Calicut Watches is a full-stack ecommerce website built with **Next.js**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Neon**, and **Cloudinary**.

The project is made for a watch company based in Calicut. Admin can add, edit, delete, and manage watches. Customers can view products, register, login, verify email using OTP, and use authentication-protected features.

---

## Features

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL database
- Neon online database
- Cloudinary image upload
- Multiple product images
- Product listing page
- Product detail page
- Admin dashboard
- Add/edit/delete watches
- Email OTP system
- Verify email
- Login by password
- Login/register route protection using middleware
- Admin-only protected pages
- Admin-only protected APIs
- Vercel deployment ready

---

## Tech Stack

```txt
Next.js
TypeScript
Tailwind CSS
PostgreSQL
Neon
Cloudinary
Nodemailer
bcryptjs
jose
Vercel

src/
  app/
    api/
      auth/
        login/
        register/
        logout/
        mail-otp/
      products/
      upload/

    admin/
      products/
        new/
        edit/

    products/
      [slug]/

    login/
    register/
    cart/
    checkout/

  components/
    Navbar.tsx
    ProductCard.tsx
    LogOutButton.tsx

  lib/
    db.ts
    cloudinary.ts
    mailer.ts

  types/
    product.ts

  middleware.ts