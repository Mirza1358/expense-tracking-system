# Expense Tracking System (ETS)

An advanced, cloud-native Expense Tracking System designed to help users efficiently manage and visualize their finances. 

This project was built leveraging modern **Cloud Computing** paradigms to ensure scalability, reliability, and ease of use. It incorporates principles of **SaaS** (Software as a Service) by providing a ready-to-use web platform, **BaaS** (Backend as a Service) by utilizing Firebase for data management and authentication, and **Serverless** architecture for seamless deployment and execution without managing infrastructure. The use of cloud technologies also enables **Elasticity**, allowing the application to scale resources automatically based on user demand.

## Features

- **Dashboard:** Interactive overview of expenses with visual charts (using Recharts).
- **Expense Management:** Add, edit, delete, and view detailed expense records.
- **Real-time Sync:** Powered by Firebase Firestore for real-time data updates.
- **Responsive Design:** A beautiful and functional interface across all devices (built with Tailwind CSS and Next.js).
- **Authentication:** Secure user login and registration powered by Firebase Authentication.

## Technologies Used

- **Frontend:** [Next.js](https://nextjs.org) (React framework), [Tailwind CSS](https://tailwindcss.com) for styling, [Recharts](https://recharts.org) for data visualization.
- **Backend / BaaS:** [Firebase](https://firebase.google.com/) (Firestore Database, Firebase Authentication).
- **Hosting:** [Vercel](https://vercel.com/) (Serverless deployment).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Vercel link :https://expense-tracker-rose-eight-32.vercel.app/auth/login

## Credits

This project was collaboratively developed by:
- **Bilal Mirza** 
- **Umer Farooq**
- **Haris Sajjad**

---

*This project was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).*
