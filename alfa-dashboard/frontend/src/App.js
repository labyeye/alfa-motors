import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import StaffPage from "./pages/StaffPage";
import SellLetterForm from "./components/SellLetterPDF";
import SellLetterHistory from "./components/SellLetterHistory";
import AdvancePaymentForm from "./components/AdvancePaymentForm";
import AdvancePaymentHistory from "./components/AdvancePaymentHistory";
import ServiceBillForm from "./components/ServiceBillForm";
import BikeHistory from "./components/BikeHistory";
import CreateStaff from "./components/CreateStaff";
import StaffList from "./components/StaffList";
import ServiceHistory from "./components/ServiceHistory";
import RcListPage from "./components/RCListPage";
import RcFormPage from "./components/RcEntryPage";
import AddcarForm from "./components/AddCarForm";
import ListCar from "./components/ListCar";
import EditCar from "./components/EditCar";
import GalleryManagement from "./pages/GalleryManagement";
import SellRequests from "./components/SellRequests";
import Refurbishment from "./components/Refurbishment";
import RefurbishmentHistory from "./components/RefurbishmentHistory";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <StaffPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/rc/list"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <RcListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/rc/create"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <RcFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/car/create"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <AddcarForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/car/list"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <ListCar />
              </PrivateRoute>
            }
          />
          <Route
            path="/car/edit/:id"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <EditCar />
              </PrivateRoute>
            }
          />
          <Route
            path="/gallery"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <GalleryManagement />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/sell/create"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <SellLetterForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/advance-payments/create"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <AdvancePaymentForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/advance-payments/history"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <AdvancePaymentHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/sell-requests"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <SellRequests />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/sell-requests/:id"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                {/* Ideally a detail page component would be used; reusing SellRequests page for now */}
                <SellRequests />
              </PrivateRoute>
            }
          />
          <Route
            path="/sell/history"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <SellLetterHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/service/create"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <ServiceBillForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/service/edit/:id"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <ServiceBillForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/bike-history"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <BikeHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff/create"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <CreateStaff />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff/list"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <StaffList />
              </PrivateRoute>
            }
          />
          <Route
            path="/service/history"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <ServiceHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/refurbishment"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <Refurbishment />
              </PrivateRoute>
            }
          />
          <Route
            path="/refurbishment/create"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <Refurbishment />
              </PrivateRoute>
            }
          />
          <Route
            path="/refurbishment/history"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <RefurbishmentHistory />
              </PrivateRoute>
            }
          />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
