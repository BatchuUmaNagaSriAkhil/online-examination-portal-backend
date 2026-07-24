# Parcel Tracker (MERN Stack)

A full-stack parcel tracking system with three roles — customer, admin, and delivery agent —
and real-time status/location updates over Socket.io + Leaflet maps.

## Stack
- **Frontend:** React (Vite), React Router, Axios, Socket.io-client, Leaflet / react-leaflet
- **Backend:** Node.js, Express, Socket.io, JWT auth
- **Database:** MongoDB + Mongoose

## Project structure
```
parcel-tracker/
  server/     Express API + Socket.io server
  client/     React (Vite) frontend
```

## 1. Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)

## 2. Backend setup
```bash
cd server
cp .env.example .env      # then fill in MONGO_URI, JWT secrets, etc.
npm install
npm run dev                # starts on http://localhost:5000
```

## 3. Frontend setup
```bash
cd client
cp .env.example .env
npm install
npm run dev                # starts on http://localhost:5173
```

## 4. Try it out
1. Go to `http://localhost:5173/register` and create a **customer** account.
2. Log in, click **+ New Shipment**, fill in sender/receiver/package details, and submit.
   Note the generated tracking ID (e.g. `TRK-AB12CD34`).
3. To test the admin/agent flow, create agent/admin accounts directly against the API
   (this is intentional — staff accounts aren't self-service):
   ```bash
   # First promote yourself to admin directly in MongoDB (one-time bootstrap):
   #   use parcel-tracker
   #   db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })

   # Then, as that admin, create an agent account:
   curl -X POST http://localhost:5000/api/users/staff \
     -H "Authorization: Bearer <admin_access_token>" \
     -H "Content-Type: application/json" \
     -d '{"name":"Agent Smith","email":"agent@example.com","password":"password123","role":"agent"}'
   ```
4. Log in as admin, assign the parcel to the agent.
5. Log in as the agent, click **Share live location** (grant browser location permission)
   and change the parcel's status — watch the customer's `/track/:trackingId` page update
   live without a refresh.

## How the real-time layer works
- Every parcel has a Socket.io "room" named after its `trackingId`.
- The tracking page (`/track/:trackingId`) joins that room on load.
- When an agent updates status or shares location, the server persists it via the REST API
  and then emits `status:update` / `location:update` to everyone in that room.
- No polling — updates appear instantly for anyone watching that parcel.

## API overview
| Method | Route | Who | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | public | Create a customer account |
| POST | `/api/auth/login` | public | Log in |
| POST | `/api/auth/refresh` | public | Refresh access token |
| POST | `/api/users/staff` | admin | Create an agent/admin account |
| POST | `/api/parcels` | customer | Create a shipment request |
| GET | `/api/parcels` | any | List parcels scoped to the caller's role |
| GET | `/api/parcels/:trackingId` | any (owner/agent/admin) | Parcel details |
| GET | `/api/parcels/:trackingId/timeline` | any (owner/agent/admin) | Status history |
| PATCH | `/api/parcels/:id/assign` | admin | Assign a delivery agent |
| PATCH | `/api/parcels/:id/status` | agent/admin | Update delivery status |
| PATCH | `/api/parcels/:id/location` | agent | Push live GPS coordinates |

## Next steps / ideas to extend
- Email/SMS notifications on status change (Nodemailer/Twilio)
- Proof-of-delivery photo upload (Cloudinary/multer) — `proofOfDeliveryUrl` field is already on the model
- Admin analytics dashboard (deliveries per day, average delivery time)
- Rate-based pricing calculator instead of manual price entry
- Dockerize both services + docker-compose for one-command local setup
