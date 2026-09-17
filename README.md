# ✈️ MakeMyTrip Clone

A full-stack, multi-service travel booking platform inspired by MakeMyTrip — book **flights, hotels, homestays, trains, buses, and cabs** from one app, with dynamic pricing, real-time flight tracking, personalized recommendations, and an admin dashboard.

**🔗 Live App:** [make-my-trip-esgv2vbed-raj-shah.vercel.app](https://make-my-trip-esgv2vbed-raj-shah.vercel.app/)
**🔗 Live API:** [make-my-trip-api.onrender.com](https://make-my-trip-api.onrender.com)

> ⚠️ Note: the backend is hosted on Render's free tier, so the API may take 20–30 seconds to respond on the first request after a period of inactivity (cold start).

---

## 📖 Overview

MakeMyTrip Clone is a production-style online travel aggregator built to practice end-to-end system design: a Spring Boot REST backend backed by MongoDB, a Next.js/React frontend, JWT-based auth, real-time WebSocket updates, and cloud deployment via Docker.

## ✨ Features

- 🛫 **Multi-service booking** — flights, hotels, homestays, trains, buses, and cabs
- 🔐 **JWT authentication** with role-based access (User / Admin)
- 💸 **Dynamic pricing engine** — surge pricing, price history, and price-freeze
- 🎟️ **Promo codes** at checkout
- 🧠 **Personalized recommendations** based on user interaction history and destination tagging
- 📡 **Live flight status tracking** over WebSockets (STOMP + SockJS)
- 🔔 **Push notifications** via Web Push (VAPID)
- ❤️ **Wishlist** to save listings for later
- ⭐ **Reviews & ratings** for hotels/homestays
- ↩️ **Cancellation & refund** workflows
- 🛠️ **Admin dashboard** for inventory, bookings, and analytics

## 🧰 Tech Stack

**Backend**
- Java 17, Spring Boot 3.2
- Spring Security + JWT (jjwt)
- Spring Data MongoDB
- Spring WebSocket (STOMP over SockJS)
- Web Push (VAPID)
- Maven, Docker

**Frontend**
- Next.js (React 19, Pages Router), TypeScript
- Tailwind CSS + shadcn/ui + Radix UI
- Redux Toolkit
- Axios
- @stomp/stompjs + sockjs-client

**Deployment**
- Backend → Render (Docker)
- Frontend → Vercel

## 🏗️ Architecture

```
┌─────────────────────┐        REST (HTTPS)        ┌──────────────────────────┐
│   Next.js Frontend   │ ─────────────────────────► │   Spring Boot Backend    │
│   (Vercel)           │ ◄───────────────────────── │   (Render, Docker)       │
│   Redux + Axios       │        WSS (STOMP)         │   REST + WebSocket API   │
└─────────────────────┘                             └────────────┬─────────────┘
                                                                  │
                                                                  ▼
                                                         ┌──────────────────┐
                                                         │     MongoDB       │
                                                         └──────────────────┘
```

## 📂 Project Structure

```
make-my-trip-clone-springboot/
├── Dockerfile
├── pom.xml
├── mvnw / mvnw.cmd
├── src/
│   ├── main/
│   │   ├── java/com/makemytrip/makemytrip/
│   │   │   ├── MakemytripApplication.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── WebConfig.java
│   │   │   │   └── WebSocketConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── AdminAuthController.java
│   │   │   │   ├── AdminController.java
│   │   │   │   ├── BookingController.java
│   │   │   │   ├── BookingPreferenceController.java
│   │   │   │   ├── CancellationController.java
│   │   │   │   ├── FileUploadController.java
│   │   │   │   ├── FlightSeatController.java
│   │   │   │   ├── FlightStatusController.java
│   │   │   │   ├── PricingController.java
│   │   │   │   ├── PromoCodeController.java
│   │   │   │   ├── PushSubscriptionController.java
│   │   │   │   ├── RecommendationController.java
│   │   │   │   ├── ReviewController.java
│   │   │   │   ├── RoomTypeController.java
│   │   │   │   ├── RootController.java
│   │   │   │   ├── SeatController.java
│   │   │   │   ├── TestController.java
│   │   │   │   ├── UserController.java
│   │   │   │   └── WishlistController.java
│   │   │   ├── models/
│   │   │   │   ├── BookingPreference.java
│   │   │   │   ├── Bus.java
│   │   │   │   ├── Cab.java
│   │   │   │   ├── Flight.java
│   │   │   │   ├── FlightSeat.java
│   │   │   │   ├── FlightStatus.java
│   │   │   │   ├── FlightTracking.java
│   │   │   │   ├── Homestay.java
│   │   │   │   ├── Hotel.java
│   │   │   │   ├── PriceFreeze.java
│   │   │   │   ├── PriceHistoryEntry.java
│   │   │   │   ├── PricingProfile.java
│   │   │   │   ├── PromoCode.java
│   │   │   │   ├── PushSubscription.java
│   │   │   │   ├── RecommendationFeedback.java
│   │   │   │   ├── Review.java
│   │   │   │   ├── RoomType.java
│   │   │   │   ├── Seat.java
│   │   │   │   ├── Train.java
│   │   │   │   ├── UserInteraction.java
│   │   │   │   ├── UserTagAffinity.java
│   │   │   │   └── Users.java
│   │   │   ├── repositories/    # one Spring Data MongoDB repository per model above
│   │   │   ├── security/
│   │   │   │   ├── JwtAuthFilter.java
│   │   │   │   └── JwtUtil.java
│   │   │   ├── services/
│   │   │   │   ├── BookingPreferenceService.java
│   │   │   │   ├── BookingService.java
│   │   │   │   ├── CancellationService.java
│   │   │   │   ├── DynamicPricingService.java
│   │   │   │   ├── FlightSeatService.java
│   │   │   │   ├── FlightStatusService.java
│   │   │   │   ├── PriceFreezeService.java
│   │   │   │   ├── PromoCodeService.java
│   │   │   │   ├── PushNotificationService.java
│   │   │   │   ├── RecommendationService.java
│   │   │   │   ├── ReviewService.java
│   │   │   │   ├── RoomTypeService.java
│   │   │   │   ├── SeatInventoryService.java
│   │   │   │   └── UserServices.java
│   │   │   └── util/
│   │   │       └── DestinationTagger.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/java/com/makemytrip/makemytrip/
│
└── makemytour/                          # Next.js frontend
    ├── package.json, tsconfig.json, tailwind.config.ts, next.config.ts
    ├── public/                          # favicon, sw.js (service worker), static assets
    └── src/
        ├── pages/
        │   ├── index.tsx, _app.tsx, _document.tsx
        │   ├── admin/ (index.tsx, analytics/index.tsx)
        │   ├── book-flight/[id], book-hotel/[id], book-homestay/[id],
        │   │   book-train/[id], book-bus/[id], book-cab/[id]
        │   ├── track-flights/, refund/[id], wishlist/, profile/,
        │   │   loyalty/, insurance/, forex/, holiday/, help/
        │   └── api/hello.ts
        ├── components/
        │   ├── Flights/, Hotel/, Homestay/, Train/, Bus/, Cab/
        │   ├── admin/, flight-tracking/, insurance/, loyalty/,
        │   │   navigation/, notifications/, passengers/, payment/,
        │   │   pricing/, promo/, recommendations/, refund/,
        │   │   reviews/, room-selection/, seat-selection/, wishlist/
        │   ├── ui/ (shadcn/ui primitives: button, card, dialog, table, tabs, ...)
        │   ├── Navbar.tsx, Fotter.tsx, Loader.tsx,
        │   │   SearchSelect.tsx, SignupDialog.tsx
        │   ├── api/index.js
        │   ├── lib/ (pricingSocket.ts, push.ts, utils.ts)
        │   ├── store/index.js               # Redux store
        │   └── styles/globals.css
```

## 🚀 Getting Started

### Prerequisites
- Java 17+, Maven
- Node.js 18+
- A MongoDB connection URI (local or Atlas)

### Backend

```bash
cd make-my-trip-clone-springboot
# configure src/main/resources/application.properties:
#   spring.data.mongodb.uri, jwt.secret, admin.bootstrap.secret,
#   vapid.public.key / vapid.private.key / vapid.subject
mvn clean install
mvn spring-boot:run
# API runs on http://localhost:8080
```

Or with Docker:

```bash
docker build -t makemytrip-backend .
docker run -p 8080:8080 --env-file .env makemytrip-backend
```

### Frontend

```bash
cd makemytour
npm install
# set NEXT_PUBLIC_API_URL (or equivalent) to your backend URL in .env.local
npm run dev
# App runs on http://localhost:3000
```

## 🔑 Environment Variables (Backend)

| Variable | Description |
|---|---|
| `spring.data.mongodb.uri` | MongoDB connection string |
| `jwt.secret` | Secret key used to sign JWTs |
| `admin.bootstrap.secret` | One-time secret to promote the first user to ADMIN |
| `vapid.public.key` / `vapid.private.key` / `vapid.subject` | Keys for Web Push notifications |

## 📡 API Overview

The backend exposes REST endpoints grouped by domain, including:
- `/api/users` — signup, login, profile
- `/api/admin` — admin auth & management
- `/api/flights`, `/api/hotels`, `/api/homestays` (via search/inventory endpoints)
- `/api/bookings`, `/api/cancellations`
- `/api/pricing`, `/api/promo-codes`
- `/api/reviews`, `/api/wishlist`, `/api/recommendations`
- `/ws` — WebSocket endpoint for live flight status

## 🖥️ Deployment

- **Backend** is containerized with a multi-stage Dockerfile (Maven build → JRE runtime) and deployed on **Render**.
- **Frontend** is deployed on **Vercel**, pointed at the live backend API.

## 🗺️ Roadmap

- [ ] Payment gateway integration
- [ ] Automated unit/integration tests
- [ ] Redis caching for search endpoints
- [ ] Multi-currency / multi-language support

## 👤 Author

**Raj Shah**
B.Tech CSE, Walchand Institute of Technology (WIT), Solapur
GitHub: [@Raj0825](https://github.com/Raj0825)

## 📄 License

This project is for educational/portfolio purposes.
