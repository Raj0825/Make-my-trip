import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

// Automatically attach the admin JWT to any request hitting a protected
// admin route, so none of the existing addflight/edithotel/etc functions
// below need to change individually.
axios.interceptors.request.use((config) => {
  const url = config.url || "";
  const isAdminRoute = url.includes("/admin/") || url.includes("/reviews/admin/");
  const isPublicAdminRoute = url.includes("/admin/login") || url.includes("/admin/bootstrap");

  if (isAdminRoute && !isPublicAdminRoute) {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// If the admin's token is missing/expired/invalid, the backend returns
// 401/403 on admin routes — clear the stale token so the UI knows to
// show the login form again instead of silently failing every request.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error?.config?.url || "";
    const isAdminRoute = url.includes("/admin/") || url.includes("/reviews/admin/");
    if (isAdminRoute && (error?.response?.status === 401 || error?.response?.status === 403)) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminToken");
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const url = `${BACKEND_URL}/user/login?email=${email}&password=${password}`;
    const res = await axios.post(url);
    const data = res.data;
    // console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (
  firstName,
  lastName,
  email,
  phoneNumber,
  password
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/user/signup`, {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    });
    const data = res.data;
    // console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getuserbyemail = async (email) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/user/email?email=${email}`);
    const data = res.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const editprofile = async (
  id,
  firstName,
  lastName,
  email,
  phoneNumber
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/user/edit?id=${id}`, {
      firstName,
      lastName,
      email,
      phoneNumber,
    });
    const data = res.data;
    return data;
  } catch (error) {}
};
export const getflight = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/flight`);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(data);
  }
};

export const addflight = async (
  flightName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/flight`, {
      flightName,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const editflight = async (
  id,
  flightName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/flight/${id}`, {
      flightName,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const gethotel = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/hotel`);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(data);
  }
};

export const addhotel = async (
  hotelName,
  location,
  pricePerNight,
  availableRooms,
  amenities
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/hotel`, {
      hotelName,
      location,
      pricePerNight,
      availableRooms,
      amenities,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const edithotel = async (
  id,
  hotelName,
  location,
  pricePerNight,
  availableRooms,
  amenities
) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/hotel/${id}`, {
      hotelName,
      location,
      pricePerNight,
      availableRooms,
      amenities,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const handleflightbooking = async (userId, flightId, seats, price, seatNumbers) => {
  try {
    let url = `${BACKEND_URL}/booking/flight?userId=${userId}&flightId=${flightId}&seats=${seats}&price=${price}`;
    if (seatNumbers && seatNumbers.length > 0) {
      url += `&seatNumbers=${encodeURIComponent(seatNumbers.join(","))}`;
    }
    const res = await axios.post(url);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const handlehotelbooking = async (userId, hotelId, rooms, price, roomTypeId, roomTypeName) => {
  try {
    let url = `${BACKEND_URL}/booking/hotel?userId=${userId}&hotelId=${hotelId}&rooms=${rooms}&price=${price}`;
    if (roomTypeId) url += `&roomTypeId=${roomTypeId}`;
    if (roomTypeName) url += `&roomTypeName=${encodeURIComponent(roomTypeName)}`;
    const res = await axios.post(url);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ---------------- Trains ----------------

export const gettrain = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/train`);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const addtrain = async (
  trainName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/train`, {
      trainName,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const edittrain = async (
  id,
  trainName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/train/${id}`, {
      trainName,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const handletrainbooking = async (userId, trainId, seats, price) => {
  try {
    const url = `${BACKEND_URL}/booking/train?userId=${userId}&trainId=${trainId}&seats=${seats}&price=${price}`;
    const res = await axios.post(url);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

// ---------------- Buses ----------------

export const getbus = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/bus`);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const addbus = async (
  busName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/bus`, {
      busName,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const editbus = async (
  id,
  busName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/bus/${id}`, {
      busName,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const handlebusbooking = async (userId, busId, seats, price) => {
  try {
    const url = `${BACKEND_URL}/booking/bus?userId=${userId}&busId=${busId}&seats=${seats}&price=${price}`;
    const res = await axios.post(url);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

// ---------------- Cabs ----------------

export const getcab = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/cab`);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const addcab = async (
  cabType,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/cab`, {
      cabType,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const editcab = async (
  id,
  cabType,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/cab/${id}`, {
      cabType,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const handlecabbooking = async (userId, cabId, seats, price) => {
  try {
    const url = `${BACKEND_URL}/booking/cab?userId=${userId}&cabId=${cabId}&seats=${seats}&price=${price}`;
    const res = await axios.post(url);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

// ---------------- Homestays ----------------

export const gethomestay = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/homestay`);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const addhomestay = async (
  homestayName,
  location,
  pricePerNight,
  availableRooms,
  amenities
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/homestay`, {
      homestayName,
      location,
      pricePerNight,
      availableRooms,
      amenities,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const edithomestay = async (
  id,
  homestayName,
  location,
  pricePerNight,
  availableRooms,
  amenities
) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/homestay/${id}`, {
      homestayName,
      location,
      pricePerNight,
      availableRooms,
      amenities,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const handlehomestaybooking = async (userId, homestayId, rooms, price) => {
  try {
    const url = `${BACKEND_URL}/booking/homestay?userId=${userId}&homestayId=${homestayId}&rooms=${rooms}&price=${price}`;
    const res = await axios.post(url);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

// ---------------- Cancellation ----------------

export const cancelbooking = async (userId, bookingId, reason) => {
  try {
    const url = `${BACKEND_URL}/booking/cancel?userId=${userId}&bookingId=${bookingId}&reason=${encodeURIComponent(reason)}`;
    const res = await axios.post(url);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ---------------- Reviews ----------------

export const createReview = async (review) => {
  // review: { serviceType, serviceId, userId, userName, rating, reviewText, photoUrls }
  try {
    const res = await axios.post(`${BACKEND_URL}/reviews`, review);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getReviews = async (serviceType, serviceId, sort = "newest", minRating, maxRating) => {
  try {
    const params = new URLSearchParams({ sort });
    if (minRating) params.append("minRating", minRating);
    if (maxRating) params.append("maxRating", maxRating);
    const url = `${BACKEND_URL}/reviews/${serviceType}/${serviceId}?${params.toString()}`;
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const replyToReview = async (reviewId, userId, userName, text) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/reviews/${reviewId}/reply`, {
      userId, userName, text,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const markReviewHelpful = async (reviewId, userId) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/reviews/${reviewId}/helpful?userId=${userId}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const flagReview = async (reviewId, userId, reason) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/reviews/${reviewId}/flag`, {
      userId, reason,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const uploadReviewPhoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(`${BACKEND_URL}/uploads/review-photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url; // relative path e.g. /uploads/reviews/xxx.jpg
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ---- Moderator (admin) ----

export const getFlaggedReviews = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/reviews/admin/flagged`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const moderateReview = async (reviewId, action) => {
  // action: "APPROVE" | "REMOVE"
  try {
    const res = await axios.put(`${BACKEND_URL}/reviews/admin/${reviewId}/moderate?action=${action}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ---------------- Admin Auth ----------------

export const adminLogin = async (email, password) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/login`, { email, password });
    // res.data: { token, email, firstName, role }
    if (typeof window !== "undefined") {
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminName", res.data.firstName || "");
    }
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const adminLogout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
  }
};

export const isAdminLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("adminToken");
};

// ---------------- Flight Status Tracking + Push ----------------

export const getVapidPublicKey = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/push/vapid-public-key`);
    return res.data; // { publicKey }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const subscribeToPush = async (userId, endpoint, keys) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/push/subscribe`, {
      userId,
      endpoint,
      keys,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getFlightStatus = async (flightId) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/flight-status/${flightId}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const trackFlight = async (userId, flightId) => {
  try {
    const res = await axios.post(
      `${BACKEND_URL}/flight-status/track?userId=${userId}&flightId=${flightId}`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const untrackFlight = async (userId, flightId) => {
  try {
    const res = await axios.delete(
      `${BACKEND_URL}/flight-status/track?userId=${userId}&flightId=${flightId}`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getTrackedFlights = async (userId) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/flight-status/tracked/${userId}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ---------------- Seat Selection + Room Types + Preferences ----------------

export const getSeatMap = async (flightId) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/flight-seats/${flightId}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getRoomTypes = async (hotelId) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/room-types/${hotelId}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getBookingPreferences = async (userId) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/preferences/${userId}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const saveBookingPreferences = async (userId, prefs) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/preferences`, {
      userId,
      seatType: prefs?.seatType,
      seatClass: prefs?.seatClass,
      roomTypeName: prefs?.roomTypeName,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};