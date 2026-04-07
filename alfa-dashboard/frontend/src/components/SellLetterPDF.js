import React, { useState, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import axios from "axios";
import {
  User,
  Download,
  IndianRupee,
  CheckCircle,
  Car,
  FileText,
} from "lucide-react";
import logo from "../images/company.png";
import logo1 from "../images/okmotorback.png";
import Sidebar from "./Sidebar";
const API_BASE =
  window.API_BASE ||
  (window.location.hostname === "localhost"
    ? "https://alfa-motors-9bk6.vercel.app"
    : "https://alfa-motors-9bk6.vercel.app");

const SellLetterForm = () => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [, setSavedLetterData] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Create Sell Letter");
  const [previewPdf, setPreviewPdf] = useState(null);
  const [previewLanguage, setPreviewLanguage] = useState("hindi");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [, setFocusedInput] = useState(null);
  const [cars, setCars] = useState([]);
  // navigation not used in this component

  const [formData, setFormData] = useState({
    vehicleName: "",
    vehicleModel: "",
    vehicleColor: "",
    fuelType: "",
    year: "",
    registrationNumber: "",
    chassisNumber: "",
    engineNumber: "",
    vehiclekm: "",
    buyerName: "",
    buyerFatherName: "",
    buyerAddress: "",
    idNumber: "",
    contactNo: "",
    buyerPhone: "",
    buyerPhone2: "",
    buyerAadhar: "",
    buyerName1: "",
    buyerName2: "",
    vehicleCondition: "running",
    saleDate: new Date().toISOString().split("T")[0],
    saleTime: new Date().toLocaleTimeString("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
    saleAmount: "",
    todayDate: new Date().toISOString().split("T")[0],
    todayTime: new Date().toLocaleTimeString("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
    previousDate: new Date().toISOString().split("T")[0],
    previousTime: new Date().toLocaleTimeString("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
    paymentMethod: "cash",
    sellerphone: "9876543210",
    selleraadhar: "764465626571",
    witnessName: "",
    witnessPhone: "",
    documentsVerified: true,
    note: "",
    // Invoice particulars
    invoiceNumber: "",
    saleValue: "",
    commission: "",
    rtoCharges: "",
    otherCharges: "",
    totalAmount: "",
    advanceAmount: "",
    balanceAmount: "",
    declaration:
      "I/We hereby agreed to take the delivery of the above mentioned vehicle by paying the balance amount on/before...",
  });
  const [isSaving, setIsSaving] = useState(false);
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "buyerName") {
        newData.buyerName1 = value;
        newData.buyerName2 = value;
      }
      if (name === "todayDate") {
        newData.previousDate = value;
      }
      if (name === "todayTime") {
        newData.previousTime = value;
      }

      return newData;
    });
  }, []);

  const handleSelectCar = (e) => {
    const carId = e.target.value;
    if (!carId) return;
    const selected = cars.find((c) => c._id === carId) || {};
    // Map available fields from car to formData; use fallbacks where names differ
    const chassis =
      selected.chassisNo ||
      selected.chassisNumber ||
      selected.chassis ||
      selected.vin ||
      "";
    const engine =
      selected.engineNo || selected.engineNumber || selected.engine || "";
    const reg =
      selected.registrationNumber ||
      selected.registrationNo ||
      selected.reg ||
      selected.regNo ||
      "";
    const km =
      selected.kmDriven !== undefined && selected.kmDriven !== null
        ? String(Number(selected.kmDriven) * 100)
        : "";

    setFormData((prev) => ({
      ...prev,
      vehicleName: selected.make || selected.brand || prev.vehicleName,
      vehicleModel: selected.model || selected.variant || prev.vehicleModel,
      vehicleColor: selected.color || prev.vehicleColor,
      year: selected.year || prev.year,
      registrationNumber: reg || prev.registrationNumber,
      chassisNumber: chassis || prev.chassisNumber,
      engineNumber: engine || prev.engineNumber,
      vehiclekm: km || prev.vehiclekm,
    }));
  };

  // Fetch cars for the inventory selector
  React.useEffect(() => {
    const fetchCars = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/cars?available=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // API may return data or data.data depending on convention
        setCars(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch cars for selector", err);
        setCars([]);
      }
    };
    fetchCars();
  }, []);

  const generatePdfBytes = async (language = "hindi") => {
    try {
      // Create a PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points

      // Embed logos (png/jpg)
      const logoBytes = await fetch(logo)
        .then((r) => r.arrayBuffer())
        .catch(() => null);
      const logo1Bytes = await fetch(logo1)
        .then((r) => r.arrayBuffer())
        .catch(() => null);
      let embeddedLogo;
      if (logoBytes) embeddedLogo = await pdfDoc.embedPng(logoBytes);
      if (logo1Bytes) await pdfDoc.embedPng(logo1Bytes);

      const { width, height } = page.getSize();

      // ---- Invoice-style layout to match provided image ----
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
      // small font removed (not used in template)

      // Header: logo left, company center, invoice title and number/date/time right
      const headerY = height - 40;
      if (embeddedLogo) {
        const logoW = 80;
        const logoH = 50;
        page.drawImage(embeddedLogo, {
          x: 40,
          y: headerY - logoH / 2 - 10,
          width: logoW,
          height: logoH,
        });
      }

      // Company title centered
      page.drawText("ALFA MOTOR WORLD", {
        x: width / 2 - 120,
        y: headerY - 6,
        size: 22,
        font,
        color: rgb(0.6, 0.06, 0.06),
      });
      page.drawText("SALE INVOICE", {
        x: width / 2 - 40,
        y: headerY - 28,
        size: 12,
        font: fontNormal,
        color: rgb(0.06, 0.06, 0.06),
      });

      // Invoice meta on right
      const invoiceX = width - 160;
      page.drawText(`No. ${formData.invoiceNumber || ""}`, {
        x: invoiceX,
        y: headerY,
        size: 10,
        font: font,
        color: rgb(0.8, 0.06, 0.06),
      });
      page.drawText(
        `Date : ${formatDate(formData.todayDate || formData.saleDate)}`,
        {
          x: invoiceX,
          y: headerY - 16,
          size: 10,
          font: fontNormal,
          color: rgb(0.06, 0.06, 0.06),
        },
      );
      page.drawText(
        `Time : ${formatTime(formData.todayTime || formData.saleTime)}`,
        {
          x: invoiceX,
          y: headerY - 32,
          size: 10,
          font: fontNormal,
          color: rgb(0.06, 0.06, 0.06),
        },
      );

      // Address line under header
      const addrY = headerY - 54;
      page.drawText(
        "# 97/2, Gottigere, Bannerghatta Main Road, Opp. D Mart, Bangalore - 560 083.",
        {
          x: 40,
          y: addrY,
          size: 9,
          font: fontNormal,
          color: rgb(0.06, 0.06, 0.06),
        },
      );

      // Customer lines: Name, Address, Id Number and Contact No
      let y = addrY - 28;
      const drawLinedField = (label, value) => {
        page.drawText(`${label}`, {
          x: 40,
          y,
          size: 10,
          font: fontNormal,
          color: rgb(0.06, 0.06, 0.06),
        });
        page.drawLine({
          start: { x: 120, y: y - 2 },
          end: { x: width - 40, y: y - 2 },
          thickness: 0.4,
          color: rgb(0.7, 0.7, 0.7),
        });
        page.drawText(String(value || ""), {
          x: 122,
          y,
          size: 10,
          font: fontNormal,
          color: rgb(0.06, 0.06, 0.06),
        });
        y -= 18;
      };

      drawLinedField("Name : ", formData.buyerName);
      drawLinedField("Address :", formData.buyerAddress);
      drawLinedField("Id Number:", formData.idNumber);
      drawLinedField("Contact No:", formData.contactNo || formData.buyerPhone);

      // Vehicle spec table (Reg. No, Make & Model, Fuel, Year, Colour)
      const tableY = y - 6;
      const tableX = 40;
      const tableW = width - 80;
      const colWidths = [
        tableW * 0.18,
        tableW * 0.35,
        tableW * 0.12,
        tableW * 0.12,
        tableW * 0.23,
      ];

      // Header row box
      let cx = tableX;
      page.drawRectangle({
        x: tableX,
        y: tableY - 28,
        width: tableW,
        height: 28,
        color: rgb(0.95, 0.95, 0.95),
      });
      // Draw column separators and labels
      const headers = ["Reg. No.", "Make & Model", "Fuel", "Year", "Colour"];
      for (let i = 0; i < headers.length; i++) {
        page.drawText(headers[i], {
          x: cx + 4,
          y: tableY - 10,
          size: 9,
          font: fontNormal,
          color: rgb(0.06, 0.06, 0.06),
        });
        cx += colWidths[i];
        // vertical line
        page.drawLine({
          start: { x: cx, y: tableY - 28 },
          end: { x: cx, y: tableY },
          thickness: 0.4,
          color: rgb(0.8, 0.8, 0.8),
        });
      }

      // Value row
      let vx = tableX;
      const valueY = tableY - 46;
      page.drawRectangle({
        x: tableX,
        y: valueY - 2,
        width: tableW,
        height: 28,
        color: rgb(1, 1, 1),
      });
      const values = [
        formData.registrationNumber,
        `${formData.vehicleName || ""} ${formData.vehicleModel || ""}`,
        formData.fuelType,
        formData.year,
        formData.vehicleColor,
      ];
      for (let i = 0; i < values.length; i++) {
        page.drawText(String(values[i] || ""), {
          x: vx + 4,
          y: valueY + 8,
          size: 9,
          font: fontNormal,
          color: rgb(0.06, 0.06, 0.06),
        });
        vx += colWidths[i];
        page.drawLine({
          start: { x: vx, y: valueY - 2 },
          end: { x: vx, y: valueY + 26 },
          thickness: 0.4,
          color: rgb(0.9, 0.9, 0.9),
        });
      }

      // Chassis and Engine line
      let ceY = valueY - 26;
      page.drawText(`Chassis No : ${formData.chassisNumber || ""}`, {
        x: 40,
        y: ceY,
        size: 9,
        font: fontNormal,
        color: rgb(0.06, 0.06, 0.06),
      });
      page.drawText(`Engine No : ${formData.engineNumber || ""}`, {
        x: width / 2 + 20,
        y: ceY,
        size: 9,
        font: fontNormal,
        color: rgb(0.06, 0.06, 0.06),
      });

      // Particulars table (Sl.No, Particulars, Amount)
      const pX = 40;
      let pY = ceY - 28;
      const pW = width - 80;
      // pCols removed (not used)

      // Draw table header
      page.drawRectangle({
        x: pX,
        y: pY - 22,
        width: pW,
        height: 22,
        color: rgb(0.95, 0.95, 0.95),
      });
      page.drawText("Sl.No.", {
        x: pX + 6,
        y: pY - 6,
        size: 9,
        font: fontNormal,
      });
      page.drawText("Particulars", {
        x: pX + 60,
        y: pY - 6,
        size: 9,
        font: fontNormal,
      });
      page.drawText("Amount (Rs.)", {
        x: pX + pW - 90,
        y: pY - 6,
        size: 9,
        font: fontNormal,
      });

      // Rows data
      const rows = [
        [
          "1",
          "Sale value",
          `Rs. ${formatRupee(formData.saleValue || formData.saleAmount || 0)}`,
        ],
        ["2", "Commission", `Rs. ${formatRupee(formData.commission || 0)}`],
        ["3", "RTO Charges", `Rs. ${formatRupee(formData.rtoCharges || 0)}`],
        ["4", "Others", `Rs. ${formatRupee(formData.otherCharges || 0)}`],
        [
          "",
          "Total",
          `Rs. ${formatRupee(
            formData.totalAmount ||
              Number(formData.saleValue || formData.saleAmount || 0) +
                Number(formData.commission || 0) +
                Number(formData.rtoCharges || 0) +
                Number(formData.otherCharges || 0),
          )}`,
        ],
        ["", "Advance", `Rs. ${formatRupee(formData.advanceAmount || 0)}`],
        [
          "",
          "Balance",
          `Rs. ${formatRupee(
            formData.balanceAmount ||
              Number(formData.totalAmount || 0) -
                Number(formData.advanceAmount || 0),
          )}`,
        ],
      ];

      pY -= 26;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        page.drawRectangle({
          x: pX,
          y: pY - 20,
          width: pW,
          height: 20,
          color: rgb(1, 1, 1),
        });
        page.drawText(row[0], {
          x: pX + 8,
          y: pY - 6,
          size: 9,
          font: fontNormal,
        });
        page.drawText(row[1], {
          x: pX + 60,
          y: pY - 6,
          size: 9,
          font: fontNormal,
        });
        page.drawText(row[2], {
          x: pX + pW - 90,
          y: pY - 6,
          size: 9,
          font: fontNormal,
        });
        pY -= 22;
      }

      // Declaration box
      const declY = pY - 8;
      page.drawRectangle({
        x: 40,
        y: declY - 100,
        width: width - 80,
        height: 100,
        color: rgb(0.98, 0.98, 0.98),
      });
      page.drawText("Declaration:", {
        x: 45,
        y: declY - 12,
        size: 9,
        font: font,
      });
      const declText =
        "I/We hereby agreed to take the delivery of the above mentioned vehicle by paying the balance amount on/before................................and also agreed that if I/We cancel the deal or fail to take the delivery of the vehicle for any reason before due date the advance amount will be completely forfeited. (and same will not be claimed by me/us)";
      page.drawText(declText, {
        x: 45,
        y: declY - 28,
        size: 8,
        font: fontNormal,
        lineHeight: 12,
        maxWidth: width - 90,
      });

      const notesText = [
        "Kindly bring ID & Address Proof at the time of delivery",
        "Note : Minimum 45days period for documentation (RTO work)",
        "Vehicle is sold in as is where condition no odometer Guarantee",
        "Car once sold will not be taken back or exchanged.",
      ];

      let noteY = declY - 65;
      for (const note of notesText) {
        page.drawText(note, {
          x: 45,
          y: noteY,
          size: 8,
          font: fontNormal,
        });
        noteY -= 10;
      }

      let signY = declY - 130;
      page.drawText("*Authorised Signature", {
        x: 50,
        y: signY,
        size: 9,
        font: fontNormal,
      });
      page.drawText("*Buyer's Signature", {
        x: width / 2 - 50,
        y: signY,
        size: 9,
        font: fontNormal,
      });
      page.drawText("*Witness", {
        x: width - 100,
        y: signY,
        size: 9,
        font: fontNormal,
      });

      // Finalize the PDF and get the bytes
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (err) {
      console.error("Error generating PDF bytes:", err);
      // return an empty pdf
      const emptyPdf = await PDFDocument.create();
      const page = emptyPdf.addPage();
      page.drawText("Error generating PDF.", { x: 50, y: 500 });
      return await emptyPdf.save();
    }
  };

  const handlePreview = async (lang) => {
    setPreviewLanguage(lang);
    const pdfBytes = await generatePdfBytes(lang);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setPreviewPdf(url);
    setShowPreviewModal(true);
  };

  const handleDownload = async (language) => {
    const pdfBytes = await generatePdfBytes(language);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, `Sale-Invoice-${formData.registrationNumber}.pdf`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/api/sell-letters`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSavedLetterData(response.data);
      setShowLanguageModal(true);
    } catch (error) {
      console.error("Error saving sell letter:", error);
      alert("Failed to save sell letter. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatRupee = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.slice(0, 5);
  };

  // Calculate totals for display in the form
  const saleValue = parseFloat(formData.saleValue) || 0;
  const commission = parseFloat(formData.commission) || 0;
  const rtoCharges = parseFloat(formData.rtoCharges) || 0;
  const otherCharges = parseFloat(formData.otherCharges) || 0;
  const totalAmount = saleValue + commission + rtoCharges + otherCharges;
  const advanceAmount = parseFloat(formData.advanceAmount) || 0;
  const balanceAmount = totalAmount - advanceAmount;

  return (
    <div style={styles.container}>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div style={styles.mainContent}>
        <div style={styles.formContainer}>
          <h1 style={styles.title}>Create Sale Invoice</h1>
          <p style={styles.subtitle}>
            Fill in the details to generate a new sale invoice.
          </p>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Car size={20} style={styles.icon} /> Vehicle Details
            </h2>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Select from Inventory</label>
                <select
                  onChange={handleSelectCar}
                  style={styles.input}
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- Select a Car --
                  </option>
                  {cars.map((car) => (
                    <option key={car._id} value={car._id}>
                      {car.make} {car.model} ({car.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Vehicle Name</label>
                <input
                  type="text"
                  name="vehicleName"
                  value={formData.vehicleName}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("vehicleName")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Vehicle Model</label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("vehicleModel")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Vehicle Color</label>
                <input
                  type="text"
                  name="vehicleColor"
                  value={formData.vehicleColor}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("vehicleColor")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Fuel Type</label>
                <input
                  type="text"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("fuelType")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Year</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("year")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("registrationNumber")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Chassis Number</label>
                <input
                  type="text"
                  name="chassisNumber"
                  value={formData.chassisNumber}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("chassisNumber")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Engine Number</label>
                <input
                  type="text"
                  name="engineNumber"
                  value={formData.engineNumber}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("engineNumber")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <User size={20} style={styles.icon} /> Buyer Details
            </h2>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Buyer Name</label>
                <input
                  type="text"
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("buyerName")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Buyer Address</label>
                <input
                  type="text"
                  name="buyerAddress"
                  value={formData.buyerAddress}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("buyerAddress")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>ID Number</label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("idNumber")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Contact Number</label>
                <input
                  type="text"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("contactNo")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <IndianRupee size={20} style={styles.icon} /> Financials
            </h2>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Sale Value</label>
                <input
                  type="number"
                  name="saleValue"
                  value={formData.saleValue}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("saleValue")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Commission</label>
                <input
                  type="number"
                  name="commission"
                  value={formData.commission}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("commission")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>RTO Charges</label>
                <input
                  type="number"
                  name="rtoCharges"
                  value={formData.rtoCharges}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("rtoCharges")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Other Charges</label>
                <input
                  type="number"
                  name="otherCharges"
                  value={formData.otherCharges}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("otherCharges")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Advance Amount</label>
                <input
                  type="number"
                  name="advanceAmount"
                  value={formData.advanceAmount}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={() => setFocusedInput("advanceAmount")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
            </div>
            <div style={styles.summaryBox}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Total Amount:</span>
                <span style={styles.summaryValue}>
                  {formatRupee(totalAmount)}
                </span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Balance Amount:</span>
                <span style={styles.summaryValue}>
                  {formatRupee(balanceAmount)}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <FileText size={20} style={styles.icon} /> Dates & Notes
            </h2>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Sale Date</label>
                <input
                  type="date"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Sale Time</label>
                <input
                  type="time"
                  name="saleTime"
                  value={formData.saleTime}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., INV-2024-001"
                />
              </div>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              onClick={handleSave}
              style={styles.saveButton}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save & Continue"}
            </button>
            <button
              onClick={() => handlePreview("english")}
              style={styles.previewButton}
            >
              Preview PDF
            </button>
          </div>
        </div>
      </div>

      {showLanguageModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>
                <CheckCircle
                  size={24}
                  style={{ color: "#22c55e", marginRight: "12px" }}
                />
                Invoice Saved
              </h2>
              <button
                onClick={() => setShowLanguageModal(false)}
                style={modalStyles.closeButton}
              >
                &times;
              </button>
            </div>
            <p style={modalStyles.modalText}>
              Your sale invoice has been saved successfully. Please choose a
              language to download the PDF.
            </p>
            <div style={modalStyles.modalActions}>
              <button
                onClick={() => handleDownload("english")}
                style={modalStyles.downloadButton}
              >
                <Download size={16} style={{ marginRight: "8px" }} />
                Download English PDF
              </button>
              <button
                onClick={() => handleDownload("hindi")}
                style={modalStyles.downloadButton}
              >
                <Download size={16} style={{ marginRight: "8px" }} />
                Download Hindi PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div style={modalStyles.overlay}>
          <div style={{ ...modalStyles.modal, width: "90%", height: "90%" }}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>Invoice Preview</h2>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  if (previewPdf) URL.revokeObjectURL(previewPdf);
                }}
                style={modalStyles.closeButton}
              >
                &times;
              </button>
            </div>
            <iframe
              src={previewPdf}
              style={{ width: "100%", height: "calc(100% - 100px)" }}
              title="PDF Preview"
            ></iframe>
            <div style={modalStyles.modalActions}>
              <button
                onClick={() => handleDownload(previewLanguage)}
                style={modalStyles.downloadButton}
              >
                Download {previewLanguage === "english" ? "English" : "Hindi"}{" "}
                PDF
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  if (previewPdf) URL.revokeObjectURL(previewPdf);
                }}
                style={modalStyles.cancelButton}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellLetterForm;

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
  },
  mainContent: {
    flex: 1,
    padding: "40px",
  },
  formContainer: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6c757d",
    marginBottom: "32px",
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#495057",
    borderBottom: "2px solid #e9ecef",
    paddingBottom: "12px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginRight: "12px",
    color: "#007bff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
    marginBottom: "8px",
  },
  input: {
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
  },
  summaryBox: {
    marginTop: "24px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },
  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
  },
  summaryLabel: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#495057",
  },
  summaryValue: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#212529",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    marginTop: "32px",
  },
  saveButton: {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#28a745",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  previewButton: {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 5px 25px rgba(0, 0, 0, 0.15)",
    width: "500px",
    maxWidth: "90%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #e9ecef",
    paddingBottom: "15px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#343a40",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "28px",
    color: "#6c757d",
    cursor: "pointer",
  },
  modalText: {
    fontSize: "16px",
    color: "#495057",
    marginBottom: "25px",
    lineHeight: 1.6,
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "20px",
  },
  downloadButton: {
    padding: "10px 20px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.2s",
  },
  cancelButton: {
    padding: "10px 20px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#495057",
    backgroundColor: "#e9ecef",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};
