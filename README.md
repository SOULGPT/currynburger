<div align="center">
  <br />
  <img src="assets/readme/hero.png" alt="Curry & Burger Project Banner">
  <br />

  <div>
    <img src="https://img.shields.io/badge/-React_Native-black?style=for-the-badge&logoColor=white&logo=react&color=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/-Expo-black?style=for-the-badge&logoColor=white&logo=expo&color=000020" alt="Expo" />
    <img src="https://img.shields.io/badge/-Supabase-black?style=for-the-badge&logoColor=white&logo=supabase&color=3ECF8E" alt="Supabase" />
    <img src="https://img.shields.io/badge/-Tailwind-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="Tailwind" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="TypeScript" />
  </div>

  <h3 align="center">Curry & Burger</h3>

  <div align="center">
    A complete restaurant management app with customer ordering, waiter workflows, kitchen display, front desk operations, and admin controls.
  </div>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 🔧 [Environment Setup](#environment-setup)
6. 🔗 [Assets](#assets)
7. 🚀 [More](#more)

## <a name="introduction">🤖 Introduction</a>

Curry & Burger is a restaurant management platform built with Expo, React Native, and Supabase. It delivers a complete operations workflow for:

- Customer ordering and menu browsing
- Waiter order taking and table management
- Kitchen order display and preparation tracking
- Front desk billing and order status updates
- Admin menu and operational management

This app is designed to support real restaurant roles with secure backend integration and mobile-first UI.

## <a name="tech-stack">⚙️ Tech Stack</a>

- **[Supabase](https://supabase.com/)** is an open-source Firebase alternative providing secure authentication (email/password, OAuth, SMS), PostgreSQL database, real-time subscriptions, file storage, edge functions, and auto-generated APIs—all managed through a unified console.

- **[Expo](https://expo.dev/)** is an open-source platform for building universal native apps (Android, iOS, web) using JavaScript/TypeScript and React Native. It features file-based routing via Expo Router, fast refresh, native modules for camera/maps/notifications, over-the-air updates (EAS), and streamlined app deployment.

- **[NativeWind](https://www.nativewind.dev/)** brings Tailwind CSS to React Native and Expo, allowing you to style mobile components using utility-first classes for fast, consistent, and responsive UI design.

- **[React Native](https://reactnative.dev/)** is a framework for building mobile UIs with React. It enables component‑based, cross-platform development with declarative UI, deep native API support, and is tightly integrated with Expo for navigation and native capabilities.

- **[Tailwind CSS](https://tailwindcss.com/)** is a utility-first CSS framework enabling rapid UI design via low-level classes. In React Native/Expo, it’s commonly used with NativeWind to apply Tailwind-style utilities to mobile components.

- **[TypeScript](https://www.typescriptlang.org/)** is a statically-typed superset of JavaScript providing type annotations, interfaces, enums, generics, and enhanced tooling. It improves error detection, code quality, and scalability—ideal for robust, maintainable projects.

- **[Zustand](https://github.com/pmndrs/zustand)** is a minimal, hook-based state management library for React and React Native. It lets you manage global state with zero boilerplate, no context providers, and excellent performance through selective state subscriptions.

- **[Sentry](https://jsm.dev/rn-food-sentry)** is a powerful error tracking and performance monitoring tool for React Native apps. It helps you detect, diagnose, and fix issues in real-time to improve app stability and user experience.



## <a name="features">🔋 Features</a>

### Features of Curry & Burger Restaurant Management System

👉 **Multi-Role Authentication**: Customer, Waiter, Kitchen, Admin, and Desk staff access with role-based routing.

👉 **Premium Customer App**: Eye-catching UI with social authentication (Google & Apple), menu browsing, cart management, and order placement.

👉 **Waiter Interface**: Table management, real-time order taking, and communication with kitchen.

👉 **Kitchen Display System**: Real-time order queue with urgency indicators, audio notifications, and one-tap order completion.

👉 **Admin Dashboard**: Full system management, menu editing, and analytics.

👉 **Front Desk**: Order processing, billing, and customer service tools.

👉 **Customer Display TV**: Takeaway order notifications with marketing integration.

👉 **Real-time Updates**: Live order status synchronization across all interfaces.

👉 **Offline Support**: Graceful degradation when network connectivity is lost.

👉 **Audio Notifications**: Kitchen alerts for new orders and urgent situations.

👉 **Supabase Integration**: PostgreSQL database with real-time subscriptions and secure authentication.

and many more, including code architecture and reusability.

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- **[Git](https://git-scm.com/)**
- **[Node.js](https://nodejs.org/en)**
- **[npm](https://www.npmjs.com/)** _(Node Package Manager)_

**Cloning the Repository**

```bash
git clone https://github.com/SOULGPT/currynburger.git
cd currynburger/food_ordering
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Fill in your credentials. See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for detailed instructions.

**Minimum Required Variables:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

**Get Supabase credentials:**
- Sign up at **[Supabase](https://supabase.com)**
- Create a new project
- Go to Settings → API
- Copy the Project URL and anon public key

**Optional but Recommended:**
```env
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_APPLE_CLIENT_ID=com.curryandburger.app
```

**Running the Project**

```bash
npx expo start
```

Open your Expo Go app on your phone or launch a local simulator/emulator.

## <a name="environment-setup">🔧 Environment Setup</a>

Detailed environment setup for Supabase, social auth, and optional Sentry configuration is available in [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md).

## <a name="assets">🔗 Assets</a>

Project assets and visual resources are included in the `assets/` folder.

## <a name="more">🚀 More</a>

This repository contains the full Curry & Burger restaurant management app with customer, waiter, kitchen, front desk, and admin interfaces.

For detailed environment configuration, see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md).
