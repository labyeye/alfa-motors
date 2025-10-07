import React, { useState, useContext, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import {
  FileText,
  ArrowLeft,
  User,
  Download,
  Calendar,
  IndianRupee,
  AlertCircle,
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Wrench,
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash,
  Car,
  CarFront,
  Bike,
  Search,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../images/company.png";


import AuthContext from "../context/AuthContext";
import Sidebar from "./Sidebar";

const ServiceBillForm = () => {
  const { user } = useContext(AuthContext);
  const [activeMenu, setActiveMenu] = useState("Create Service Bill");
  const [expandedMenus, setExpandedMenus] = useState({});
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [availableCars, setAvailableCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [formData, setFormData] = useState({
    taxEnabled: false,
    businessName: "",
    businessGSTIN: "",
    businessAddress: "",
    totalAmount: 0,
    taxAmount: 0,
    grandTotal: 0,
    balanceDue: 0,
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerEmail: "",
  vehicleType: "car",
  vehicleBrand: "",
  vehicleModel: "",
  chassisNumber: "",
  engineNumber: "",
  kmReading: "",
    serviceDate: new Date().toISOString().split("T")[0],
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow's date
    serviceType: "regular",
    serviceItems: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    discount: 0,
    taxRate: 18,
    paymentMethod: "cash",
    paymentStatus: "pending",
    advancePaid: 0,
    issuesReported: "",
    technicianNotes: "",
    warrantyInfo: "",
  });

  const [previewMode, setPreviewMode] = useState(false);
  const API_BASE_URL = "https://alfa-motors.onrender.com/api";

  // Fetch available cars on component mount
  useEffect(() => {
    fetchAvailableCars();
  }, []);

  // If editId is present, fetch service bill and prefill form
  useEffect(() => {
    if (!editId) return;
    (async function loadBill() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/service-bills/${editId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const bill = res.data.data || res.data;
        if (bill) {
          // Map server fields into formData shape
          setFormData(prev => ({
            ...prev,
            customerName: bill.customerName || prev.customerName,
            customerPhone: bill.customerPhone || prev.customerPhone,
            customerAddress: bill.customerAddress || prev.customerAddress,
            customerEmail: bill.customerEmail || prev.customerEmail,
            vehicleType: bill.vehicleType || prev.vehicleType,
            vehicleBrand: bill.vehicleBrand || prev.vehicleBrand,
            vehicleModel: bill.vehicleModel || prev.vehicleModel,
            chassisNumber: bill.chassisNumber || prev.chassisNumber,
            engineNumber: bill.engineNumber || prev.engineNumber,
            kmReading: bill.kmReading || prev.kmReading,
            serviceDate: bill.serviceDate ? new Date(bill.serviceDate).toISOString().split('T')[0] : prev.serviceDate,
            deliveryDate: bill.deliveryDate ? new Date(bill.deliveryDate).toISOString().split('T')[0] : prev.deliveryDate,
            serviceType: bill.serviceType || prev.serviceType,
            serviceItems: bill.serviceItems && bill.serviceItems.length ? bill.serviceItems : prev.serviceItems,
            discount: bill.discount || prev.discount,
            taxRate: bill.taxRate || prev.taxRate,
            taxEnabled: bill.taxEnabled || prev.taxEnabled,
            paymentMethod: bill.paymentMethod || prev.paymentMethod,
            paymentStatus: bill.paymentStatus || prev.paymentStatus,
            advancePaid: bill.advancePaid || prev.advancePaid,
            issuesReported: bill.issuesReported || prev.issuesReported,
            technicianNotes: bill.technicianNotes || prev.technicianNotes,
            warrantyInfo: bill.warrantyInfo || prev.warrantyInfo,
          }));
        }
      } catch (err) {
        console.error('Failed to load service bill for edit', err);
        alert('Failed to load service bill for edit.');
      }
    })();
  }, [editId]);

  const fetchAvailableCars = async () => {
    try {
      setIsLoadingCars(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/cars`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const cars = response.data.data || [];
      console.debug('Fetched cars:', cars);
      setAvailableCars(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      alert("Failed to load vehicle data. You can still enter details manually.");
    } finally {
      setIsLoadingCars(false);
    }
  };

  const handleVehicleSelection = (carId) => {
    setSelectedCarId(carId);
    if (carId) {
      const selectedCar = availableCars.find(car => car._id === carId);
      if (selectedCar) {
        console.debug('Selected car for autofill:', selectedCar);
        // Fallbacks for different possible field names
        const chassis = selectedCar.chassisNo || selectedCar.chassisNumber || selectedCar.chassis || selectedCar.vin || selectedCar.chassisNumberRaw || "";
        const engine = selectedCar.engineNo || selectedCar.engineNumber || selectedCar.engine || "";
        const km = typeof selectedCar.kmDriven !== 'undefined' && selectedCar.kmDriven !== null
          ? selectedCar.kmDriven
          : (selectedCar.mileage || selectedCar.km || selectedCar.km_reading || "");

        setFormData(prev => ({
          ...prev,
          vehicleType: "car",
          vehicleBrand: selectedCar.make || "",
          vehicleModel: selectedCar.model || "",
          chassisNumber: chassis || "",
          engineNumber: engine || "",
          kmReading: km !== "" ? String(km) : "",
        }));
      }
    } else {
      // Clear fields if no vehicle selected
      setFormData(prev => ({
        ...prev,
        vehicleType: "car",
        vehicleBrand: "",
        vehicleModel: "",
        chassisNumber: "",
        engineNumber: "",
        kmReading: "",
      }));
    }
  };
  const calculateAmounts = (data) => {
    const totalAmount = (data.serviceItems || []).reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.rate || 0),
      0
    );
    const taxAmount = data.taxEnabled
      ? ((data.taxRate || 0) / 100) * totalAmount
      : 0;

    const grandTotal = totalAmount + taxAmount - (data.discount || 0);
    const balanceDue = grandTotal - (data.advancePaid || 0);

    return {
      totalAmount,
      taxAmount,
      grandTotal,
      balanceDue,
    };
  };
  const handleServiceItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...formData.serviceItems];
    items[index] = {
      ...items[index],
      [name]:
        name === "quantity" || name === "rate" ? parseFloat(value) || 0 : value,
    };

    items[index].amount = items[index].quantity * items[index].rate;

    setFormData({
      ...formData,
      serviceItems: items,
      ...calculateAmounts({ ...formData, serviceItems: items }),
    });
  };

  const addServiceItem = () => {
    setFormData({
      ...formData,
      serviceItems: [
        ...formData.serviceItems,
        { description: "", quantity: 1, rate: 0, amount: 0 },
      ],
    });
  };

  const removeServiceItem = (index) => {
    const items = formData.serviceItems.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      serviceItems: items,
      ...calculateAmounts({ ...formData, serviceItems: items }),
    });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? parseFloat(value) || 0 : value;

    const newData = {
      ...formData,
      [name]: val,
    };

    if (name === "discount" || name === "taxRate" || name === "advancePaid") {
      Object.assign(newData, calculateAmounts(newData));
    }

    setFormData(newData);
  };

  const saveServiceBill = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/service-bills`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Service bill saved successfully!");
      return response.data;
    } catch (error) {
      console.error("Error saving service bill:", error);
      alert(
        `Failed to save service bill: ${
          error.response?.data?.message || error.message
        }`
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndDownload = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      // Include user ID in the form data
      const formDataWithUser = {
        ...formData,
        user: user._id, // Assuming your AuthContext provides the user object with _id
      };

      // First save the bill (POST for create, PUT for edit)
      let saveResponse;
      if (editId) {
        saveResponse = await axios.put(
          `${API_BASE_URL}/service-bills/${editId}`,
          formDataWithUser,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
      } else {
        saveResponse = await axios.post(
          `${API_BASE_URL}/service-bills`,
          formDataWithUser,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
      }

      // Rest of your download logic remains the same...
      console.log("Save response:", saveResponse.data);

      if (
        !saveResponse.data ||
        !saveResponse.data.data ||
        !saveResponse.data.data._id
      ) {
        throw new Error("Invalid response format from server");
      }

      const billId = saveResponse.data.data._id;

      // Then download the PDF
      const pdfResponse = await axios.get(
        `${API_BASE_URL}/service-bills/${billId}/download`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
        }
      );

      if (!pdfResponse.data) {
        throw new Error("No PDF data received from server");
      }

      // Create download link
      const pdfBlob = new Blob([pdfResponse.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `service-bill-${billId}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      alert("Service bill saved and downloaded successfully!");
    } catch (error) {
      console.error("Error in save and download:", error);

      let errorMessage = "Failed to save and download";
      if (error.response) {
        errorMessage += `: ${error.response.status} - ${
          error.response.data?.message || "No error details"
        }`;
      } else if (error.request) {
        errorMessage += ": No response from server";
      } else {
        errorMessage += `: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const generateServiceBillPDF = async (billData = formData) => {
    try {
      const templateUrl = "/templates/service-bill.pdf";
      const existingPdfBytes = await fetch(templateUrl).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPages()[0];
      const font = await pdfDoc.embedFont(PDFDocument.Font.Helvetica);
      const fontBold = await pdfDoc.embedFont(PDFDocument.Font.HelveticaBold);
      page.drawText(billData.customerName, { x: 50, y: 650, size: 11 });
      page.drawText(billData.customerPhone, { x: 300, y: 650, size: 11 });
      page.drawText(billData.customerAddress, { x: 50, y: 630, size: 11 });
      if (billData.taxEnabled) {
        page.drawText("Business Information:", {
          x: 50,
          y: 610,
          size: 14,
          font: fontBold,
        });
        page.drawText(`Name: ${billData.businessName || "N/A"}`, {
          x: 350,
          y: 650,
          size: 12,
          font,
        });
        page.drawText(`GSTIN: ${billData.businessGSTIN || "N/A"}`, {
          x: 50,
          y: 650,
          size: 12,
          font,
        });
        page.drawText(`Address: ${billData.businessAddress || "N/A"}`, {
          x: 50,
          y: 550,
          size: 12,
          font,
        });
      }
      page.drawText(billData.vehicleType.toUpperCase(), {
        x: 50,
        y: 600,
        size: 11,
      });
      page.drawText(billData.vehicleBrand, { x: 150, y: 600, size: 11 });
      page.drawText(billData.vehicleModel, { x: 300, y: 600, size: 11 });
      page.drawText(billData.chassisNumber || "N/A", {
        x: 50,
        y: 580,
        size: 11,
      });
      page.drawText(billData.engineNumber || "N/A", {
        x: 250,
        y: 580,
        size: 11,
      });
      page.drawText(billData.kmReading.toString(), {
        x: 450,
        y: 580,
        size: 11,
      });
      page.drawText(billData.serviceDate, { x: 50, y: 550, size: 11 });
      page.drawText(billData.deliveryDate, { x: 200, y: 550, size: 11 });
      page.drawText(billData.serviceType.toUpperCase(), {
        x: 350,
        y: 550,
        size: 11,
      });
      let yPos = 500;
      billData.serviceItems.forEach((item, index) => {
        page.drawText((index + 1).toString(), { x: 50, y: yPos, size: 10 });
        page.drawText(item.description, { x: 80, y: yPos, size: 10 });
        page.drawText(item.quantity.toString(), { x: 300, y: yPos, size: 10 });
        page.drawText(item.rate.toFixed(2), { x: 350, y: yPos, size: 10 });
        page.drawText(item.amount.toFixed(2), { x: 450, y: yPos, size: 10 });
        yPos -= 20;
      });
      page.drawText(billData.totalAmount.toFixed(2), {
        x: 450,
        y: 350,
        size: 11,
      });
      page.drawText(billData.taxRate + "%", { x: 350, y: 330, size: 11 });
      page.drawText(billData.taxAmount.toFixed(2), {
        x: 450,
        y: 330,
        size: 11,
      });
      page.drawText(billData.discount.toFixed(2), { x: 450, y: 310, size: 11 });
      page.drawText(billData.grandTotal.toFixed(2), {
        x: 450,
        y: 290,
        size: 11,
      });
      page.drawText(billData.advancePaid.toFixed(2), {
        x: 450,
        y: 270,
        size: 11,
      });
      page.drawText(billData.balanceDue.toFixed(2), {
        x: 450,
        y: 250,
        size: 11,
      });
      page.drawText(billData.paymentMethod.toUpperCase(), {
        x: 150,
        y: 220,
        size: 11,
      });
      page.drawText(billData.paymentStatus.toUpperCase(), {
        x: 350,
        y: 220,
        size: 11,
      });
      page.drawText(billData.issuesReported || "N/A", {
        x: 50,
        y: 180,
        size: 10,
      });
      page.drawText(billData.technicianNotes || "N/A", {
        x: 50,
        y: 150,
        size: 10,
      });
      page.drawText(billData.warrantyInfo || "N/A", {
        x: 50,
        y: 120,
        size: 10,
      });

      if (billData.taxEnabled) {
        page.drawText("Business Information:", {
          x: 50,
          y: 610,
          size: 14,
          font: fontBold,
        });
        page.drawText(`Name: ${billData.businessName || "N/A"}`, {
          x: 50,
          y: 590,
          size: 12,
          font,
        });
        page.drawText(`GSTIN: ${billData.businessGSTIN || "N/A"}`, {
          x: 50,
          y: 570,
          size: 12,
          font,
        });
        page.drawText(`Address: ${billData.businessAddress || "N/A"}`, {
          x: 50,
          y: 550,
          size: 12,
          font,
        });

        // Adjust the Y positions of subsequent elements to make space
        // You'll need to adjust all Y positions below this section accordingly
      }

      const pdfBytes = await pdfDoc.save();
      saveAs(
        new Blob([pdfBytes], { type: "application/pdf" }),
        `service-bill-${new Date().getTime()}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };
  const handleInput = (e) => {
    const { name, value } = e.target;
    e.target.value = value.toUpperCase();
    handleChange(e);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  // In the menuItems array (around line 250 in BuyLetterPDF.js)
  


  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleMenuClick = (menuName, path) => {
    setActiveMenu(menuName);
    const actualPath = typeof path === "function" ? path(user?.role) : path;
    navigate(actualPath);
  };

  // Preview will show as a modal overlay when previewMode is true

  return (
    <div style={styles.container}>
      {/* Preview Modal Overlay */}
      {previewMode && (
        <div style={styles.modalBackdrop} onClick={() => setPreviewMode(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.formPreviewHeader}>
              <button onClick={() => setPreviewMode(false)} style={styles.backButton}>
                <ArrowLeft style={styles.buttonIcon} /> Close Preview
              </button>
              <div style={styles.previewActions}>
                <button onClick={() => generateServiceBillPDF()} style={styles.downloadButton}>
                  <Download style={styles.buttonIcon} /> Download PDF
                </button>
              </div>
            </div>
            <div style={styles.pdfPreview}>
              <p>PDF Preview would show here</p>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar component */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.contentPadding}>
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>Create Service Bill</h1>
            <p style={styles.pageSubtitle}>
              Fill in the details to generate a service bill for the vehicle
            </p>
          </div>

          <form style={styles.form}>
            {/* Customer Information */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <User style={styles.sectionIcon} /> Customer Information
              </h2>
              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <User style={styles.formIcon} />
                    Customer Name || ग्राहक का नाम
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    required
                    maxLength={30}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <User style={styles.formIcon} />
                    Customer Phone || ग्राहक का फोन नंबर
                  </label>
                  <input
                    type="text"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    required
                    maxLength={10}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <User style={styles.formIcon} />
                    Customer Address || ग्राहक का पता
                  </label>
                  <input
                    type="text"
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    required
                    maxLength={100}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <User style={styles.formIcon} />
                    Customer Email || ग्राहक का ईमेल
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    maxLength={30}
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <Car style={styles.sectionIcon} /> Vehicle Information
              </h2>
              
              {/* Vehicle Selection from Inventory */}
              <div style={styles.vehicleSelectionContainer}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Search style={styles.formIcon} />
                    Select Vehicle from Inventory || इन्वेंटरी से वाहन चुनें
                  </label>
                  <select
                    value={selectedCarId}
                    onChange={(e) => handleVehicleSelection(e.target.value)}
                    style={styles.formSelect}
                    disabled={isLoadingCars}
                  >
                    <option value="">
                      {isLoadingCars ? "Loading vehicles..." : "Select a vehicle or enter manually"}
                    </option>
                    {availableCars.map((car) => (
                      <option key={car._id} value={car._id}>
                        {car.make} {car.model} {car.variant} ({car.modelYear})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.orDivider}>
                  <span>OR Enter Manually || या मैन्युअल रूप से दर्ज करें</span>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    Vehicle Brand || वाहन का ब्रांड
                  </label>
                  <input
                    type="text"
                    name="vehicleBrand"
                    value={formData.vehicleBrand}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    required
                    maxLength={15}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    Vehicle Model || वाहन का मॉडल
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    Chassis Number || चासिस नंबर
                  </label>
                  <input
                    type="text"
                    name="chassisNumber"
                    value={formData.chassisNumber}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    maxLength={15}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    Engine Number || इंजन नंबर
                  </label>
                  <input
                    type="text"
                    name="engineNumber"
                    value={formData.engineNumber}
                    onChange={handleChange}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    KM Reading || किलोमीटर पढ़ाई
                  </label>
                  <input
                    type="text"
                    name="kmReading"
                    value={
                      formData.kmReading === ""
                        ? ""
                        : new Intl.NumberFormat("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(Number(formData.kmReading) / 100)
                    }
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        kmReading: rawValue,
                      }));
                    }}
                    placeholder="e.g. 36,000.00"
                  />
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <Wrench style={styles.sectionIcon} /> Service Details
              </h2>
              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Calendar style={styles.formIcon} />
                    Service Date || सेवा की तिथि
                  </label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={formData.serviceDate}
                    onChange={handleChange}
                    style={styles.formInput}
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Calendar style={styles.formIcon} />
                    Delivery Date || डिलीवरी की तिथि
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    required
                    maxLength={10}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Wrench style={styles.formIcon} />
                    Service Type || सेवा का प्रकार
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    style={styles.formSelect}
                    required
                  >
                    <option value="regular">Regular Service</option>
                    <option value="premium">Premium Service</option>
                    <option value="custom">Custom Service</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Service Items */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <ShoppingCart style={styles.sectionIcon} /> Service Items
              </h2>
              <div style={{ marginBottom: "20px" }}>
                {formData.serviceItems.map((item, index) => (
                  <div key={index} style={styles.serviceItemRow}>
                    <div style={styles.serviceItemField}>
                      <label style={styles.formLabel}>
                        Description || विवरण
                      </label>
                      <input
                        type="text"
                        name="description"
                        value={item.description}
                        onChange={(e) => handleServiceItemChange(index, e)}
                        onInput={handleInput}
                        style={styles.formInput}
                        required
                        maxLength={30}
                      />
                    </div>
                    <div style={styles.serviceItemField}>
                      <label style={styles.formLabel}>Qty || मात्रा</label>
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleServiceItemChange(index, e)}
                        style={styles.formInput}
                        min="1"
                        required
                        maxLength={10}
                      />
                    </div>
                    <div style={styles.serviceItemField}>
                      <label style={styles.formLabel}>Rate (₹) || दर (₹)</label>
                      <input
                        type="number"
                        name="rate"
                        value={item.rate}
                        onChange={(e) => handleServiceItemChange(index, e)}
                        style={styles.formInput}
                        min="0"
                        step="0.01"
                        required
                        maxLength={10}
                      />
                    </div>
                    <div style={styles.serviceItemField}>
                      <label style={styles.formLabel}>
                        Amount (₹) || राशि (₹)
                      </label>
                      <input
                        type="text"
                        value={item.amount.toFixed(2)}
                        style={styles.formInput}
                        readOnly
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeServiceItem(index)}
                      style={styles.removeItemButton}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addServiceItem}
                  style={styles.addItemButton}
                >
                  <Plus size={16} /> Add Service Item
                </button>
              </div>
            </div>

            {/* Payment Information */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <IndianRupee style={styles.sectionIcon} /> Payment Information
              </h2>
              <div style={styles.formGrid}>
                {/* Add this toggle switch at the top of the payment section */}
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <IndianRupee style={styles.formIcon} />
                    Enable Tax || कर सक्षम करें
                  </label>
                  <div style={styles.toggleContainer}>
                    <label style={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        checked={formData.taxEnabled}
                        onChange={() => {
                          const newData = {
                            ...formData,
                            taxEnabled: !formData.taxEnabled,
                            // Reset tax rate to 18 when enabling
                            taxRate: !formData.taxEnabled ? 18 : 0,
                          };
                          setFormData({
                            ...newData,
                            ...calculateAmounts(newData),
                          });
                        }}
                      />
                      <span style={styles.toggleSlider}></span>
                    </label>
                  </div>
                </div>
                {formData.taxEnabled && (
                  <>
                    <div style={styles.formField}>
                      <label style={styles.formLabel}>
                        Business Name || व्यापार का नाम
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        onInput={handleInput}
                        style={styles.formInput}
                        maxLength={30}
                      />
                    </div>
                    <div style={styles.formField}>
                      <label style={styles.formLabel}>
                        Business GSTIN || व्यापार का GSTIN
                      </label>
                      <input
                        type="text"
                        name="businessGSTIN"
                        value={formData.businessGSTIN}
                        onChange={handleChange}
                        onInput={handleInput}
                        style={styles.formInput}
                        maxLength={11}
                      />
                    </div>
                    <div style={styles.formField}>
                      <label style={styles.formLabel}>
                        Business Address || व्यापार का पता
                      </label>
                      <textarea
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleChange}
                        rows={3}
                        onInput={handleInput}
                        style={styles.formTextarea}
                        maxLength={100}
                      />
                    </div>
                  </>
                )}
              </div>
              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <IndianRupee style={styles.formIcon} />
                    Sub Total (₹) || कुल राशि (₹)
                  </label>
                  <input
                    type="number"
                    value={(formData.totalAmount || 0).toFixed(2)}
                    style={styles.formInput}
                    readOnly
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <IndianRupee style={styles.formIcon} />
                    Tax Rate (%) || कर दर (%)
                  </label>
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxEnabled ? formData.taxRate : 0}
                    onChange={handleChange}
                    style={styles.formInput}
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={!formData.taxEnabled}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <IndianRupee style={styles.formIcon} />
                    Tax Amount (₹) || कर राशि (₹)
                  </label>
                  <input
                    type="number"
                    value={
                      formData.taxEnabled
                        ? formData.taxAmount.toFixed(2)
                        : "0.00"
                    }
                    style={styles.formInput}
                    readOnly
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <IndianRupee style={styles.formIcon} />
                    Discount (₹) || छूट (₹)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    style={styles.formInput}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <IndianRupee style={styles.formIcon} />
                    Grand Total (₹) || कुल राशि (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.grandTotal.toFixed(2)}
                    style={styles.formInput}
                    readOnly
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <IndianRupee style={styles.formIcon} />
                    Advance Paid (₹) || आगामी भुगतान (₹)
                  </label>
                  <input
                    type="number"
                    name="advancePaid"
                    value={formData.advancePaid}
                    onChange={handleChange}
                    style={styles.formInput}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <IndianRupee style={styles.formIcon} />
                    Balance Due (₹) || बैलेंस डु (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.balanceDue.toFixed(2)}
                    style={styles.formInput}
                    readOnly
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <IndianRupee style={styles.formIcon} />
                    Payment Method || भुगतान की विधि
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    style={styles.formSelect}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <IndianRupee style={styles.formIcon} />
                    Payment Status || भुगतान की स्थिति
                  </label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                    style={styles.formSelect}
                  >
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <AlertCircle style={styles.sectionIcon} /> Additional
                Information
              </h2>
              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <AlertCircle style={styles.formIcon} />
                    Issues Reported || समस्याएं रिपोर्ट की गई
                  </label>
                  <textarea
                    name="issuesReported"
                    value={formData.issuesReported}
                    onChange={handleChange}
                    rows={3}
                    onInput={handleInput}
                    style={styles.formTextarea}
                    maxLength={100}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <AlertCircle style={styles.formIcon} />
                    Technician Notes || तकनीकी नोट्स
                  </label>
                  <textarea
                    name="technicianNotes"
                    value={formData.technicianNotes}
                    onChange={handleChange}
                    rows={3}
                    onInput={handleInput}
                    style={styles.formTextarea}
                    maxLength={100}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <AlertCircle style={styles.formIcon} />
                    Warranty Information || बिक्री की विधि
                  </label>
                  <textarea
                    name="warrantyInfo"
                    value={formData.warrantyInfo}
                    onChange={handleChange}
                    rows={3}
                    onInput={handleInput}
                    style={styles.formTextarea}
                    maxLength={100}
                  />
                </div>
              </div>
            </div>

            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                style={styles.previewButton}
              >
                <FileText style={styles.buttonIcon} /> Preview
              </button>
              <button
                type="button"
                onClick={handleSaveAndDownload}
                style={styles.downloadButton}
              >
                <Download style={styles.buttonIcon} /> Save & Download
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    fontFamily: "'Inter', sans-serif",
  },
  sidebar: {
    width: "280px",
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    position: "sticky",
    top: 0,
    height: "100vh",
    backgroundImage: "linear-gradient(to bottom, #1e293b, #0f172a)",
  },
  sidebarHeader: {
    padding: "24px",
    borderBottom: "1px solid #334155",
  },
  sidebarTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#ffffff",
    margin: 0,
  },
  sidebarSubtitle: {
    fontSize: "0.875rem",
    color: "#94a3b8",
    margin: "4px 0 0 0",
  },
  nav: {
    padding: "16px 0",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 24px",
    cursor: "pointer",
    color: "#e2e8f0",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    ":hover": {
      backgroundColor: "#334155",
    },
  },

  menuItemActive: {
    backgroundColor: "#334155",
    borderRight: "3px solid #3b82f6",
    color: "#ffffff",
  },
  menuItemContent: {
    display: "flex",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: "12px",
    color: "#94a3b8",
  },
  menuText: {
    fontSize: "0.9375rem",
    fontWeight: "500",
  },
  submenu: {
    backgroundColor: "#1a2536",
  },
  submenuItem: {
    padding: "10px 24px 10px 64px",
    cursor: "pointer",
    color: "#cbd5e1",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#2d3748",
    },
  },
  submenuItemActive: {
    backgroundColor: "#2d3748",
    color: "#ffffff",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    padding: "12px 24px",
    cursor: "pointer",
    color: "#f87171",
    marginTop: "16px",
    borderTop: "1px solid #334155",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#7f1d1d20",
    },
  },
  mainContent: {
    flex: 1,
    overflow: "auto",
    backgroundColor: "#ffffff",
  },
  contentPadding: {
    padding: "32px",
  },
  header: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  pageSubtitle: {
    fontSize: "1rem",
    color: "#64748b",
    margin: "8px 0 0 0",
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "32px",
    border: "1px solid #e2e8f0",
  },
  formSection: {
    marginBottom: "40px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e2e8f0",
    ":last-child": {
      borderBottom: "none",
      marginBottom: "0",
    },
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    paddingBottom: "8px",
    borderBottom: "1px solid #e2e8f0",
  },
  sectionIcon: {
    color: "#64748b",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  formField: {
    marginBottom: "16px",
  },
  formLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#334155",
    marginBottom: "8px",
  },
  formInput: {
    width: "90%",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
    backgroundColor: "#f8fafc",
    ":focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      backgroundColor: "#ffffff",
    },
  },
  formSelect: {
    width: "90%",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "0.875rem",
    backgroundColor: "#f8fafc",
    transition: "all 0.2s ease",
    appearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.5rem center",
    backgroundSize: "1em",
    ":focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      backgroundColor: "#ffffff",
    },
  },
  formTextarea: {
    width: "90%",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "0.875rem",
    minHeight: "80px",
    resize: "vertical",
    transition: "all 0.2s ease",
    backgroundColor: "#f8fafc",
  },
  previewButton: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#2563eb",
    },
  },
  saveButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#2563eb",
    },
  },
  downloadButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#2563eb",
    },
  },
  buttonIcon: {
    marginRight: "8px",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modalContent: {
    width: "90%",
    maxWidth: "900px",
    maxHeight: "90vh",
    overflow: "auto",
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },
  formPreviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  backButton: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  pdfPreview: {
    minHeight: "60vh",
    border: "1px dashed #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    background: "#fff",
  },
  vehicleSelectionContainer: {
    backgroundColor: "#f8fafc",
    border: "2px dashed #cbd5e1",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    textAlign: "center",
  },
  orDivider: {
    margin: "16px 0",
    position: "relative",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  orDivider: {
    margin: "16px 0",
    position: "relative",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "0.875rem",
    fontWeight: "500",
    "::before": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: 0,
      right: 0,
      height: "1px",
      backgroundColor: "#d1d5db",
      zIndex: 1,
    },
  },
  "orDivider span": {
    backgroundColor: "#f8fafc",
    padding: "0 16px",
    position: "relative",
    zIndex: 2,
  },
};

export default ServiceBillForm;
