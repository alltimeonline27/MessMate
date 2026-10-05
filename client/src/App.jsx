import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/dashboard/Dashboard";
import Members from "./pages/members/Members";
import MemberDetails from "./pages/members/MemberDetails";

import Menu from "./pages/menu/Menu";
import MealPoll from "./pages/meals/MealPoll";
import MealHistory from "./pages/meals/MealHistory";
import MealEntry from "./pages/meals/MealEntry";

import Expenses from "./pages/expenses/Expenses";
import Payments from "./pages/payments/Payments";
import Reports from "./pages/reports/Reports";

import Notifications from "./pages/notifications/Notifications";
import Profile from "./pages/profile/Profile";
import MessSettings from "./pages/Mess/MessSettings";

import Invites from "./pages/invites/Invites";
import JoinMess from "./pages/join/JoinMess";
import JoinRequests from "./pages/join/JoinRequests";

import GeneralPoll from "./pages/polls/GeneralPoll";

import Bazar from "./pages/bazar/Bazar";
import BazarSchedule from "./pages/bazar/BazarSchedule";

import ProtectedRoute from "./components/ProtectedRoute";

import AppLayout from "./components/Layout/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================== */}

        <Route path="/" element={<Login />} />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/join/:inviteCode"
          element={<JoinMess />}
        />


        {/* =========================
            PROTECTED APP
        ========================== */}

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >

          {/* Dashboard */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* Members */}

          <Route
            path="/members"
            element={<Members />}
          />

          <Route
            path="/members/:id"
            element={<MemberDetails />}
          />


          {/* Meals */}

          <Route path="/menu" element={<Menu />} />

          <Route
            path="/meal-poll"
            element={<MealPoll />}
          />

          <Route
            path="/meal-history"
            element={<MealHistory />}
          />

          <Route
            path="/meal-entry"
            element={<MealEntry />}
          />


          {/* Expenses */}

          <Route
            path="/expenses"
            element={<Expenses />}
          />


          {/* Payments */}

          <Route
            path="/payments"
            element={<Payments />}
          />


          {/* Reports */}

          <Route
            path="/reports"
            element={<Reports />}
          />


          {/* Notifications */}

          <Route
            path="/notifications"
            element={<Notifications />}
          />


          {/* Profile */}

          <Route
            path="/profile"
            element={<Profile />}
          />


          {/* Mess Settings */}

          <Route
            path="/mess-settings"
            element={<MessSettings />}
          />


          {/* Invites */}

          <Route
            path="/invites"
            element={<Invites />}
          />


          {/* Join Requests */}

          <Route
            path="/join-requests"
            element={<JoinRequests />}
          />


          {/* General Poll */}

          <Route
            path="/general-polls"
            element={<GeneralPoll />}
          />


          {/* Bazar */}

          <Route
            path="/bazar"
            element={<Bazar />}
          />

          <Route
            path="/bazar-schedule"
            element={<BazarSchedule />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;