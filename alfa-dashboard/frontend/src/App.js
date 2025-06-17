import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import StaffPage from "./pages/StaffPage";
import SellLetterForm from "./components/SellLetterPDF";
import SellLetterHistory from "./components/SellLetterHistory";
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
            path="/sell/create"
            element={
              <PrivateRoute roles={["admin", "staff"]}>
                <SellLetterForm />
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
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
