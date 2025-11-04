import React, { useState, useCallback, useContext } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import axios from "axios";
import {
  User,
  FileSignature,
  Download,
  Calendar,
  Clock,
  IndianRupee,
  CheckCircle,
  LayoutDashboard,
  TrendingUp,
  Wrench,
  Users,
  AlertCircle,
  Bike,
  CarFront,
  Car,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../images/company.png";
import logo1 from "../images/okmotorback.png";
import Sidebar from "./Sidebar";
import AuthContext from "../context/AuthContext";

// API base (shared pattern across components)
const API_BASE =
  window.API_BASE ||
  (window.location.hostname === "localhost"
    ? "https://alfa-motors-5yfh.vercel.app"
    : "https://alfa-motors-5yfh.vercel.app");

const SellLetterForm = () => {
  const { user } = useContext(AuthContext);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [savedLetterData, setSavedLetterData] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Create Sell Letter");
  const [expandedMenus, setExpandedMenus] = useState({});
  const [previewPdf, setPreviewPdf] = useState(null);
  const [previewLanguage, setPreviewLanguage] = useState("hindi");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [cars, setCars] = useState([]);
  const navigate = useNavigate();

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

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: (userRole) => (userRole === "admin" ? "/admin" : "/staff"),
    },
    {
      name: "RTO",
      icon: Car,
      submenu: [
        { name: "RC Entry", path: "/rc/create" },
        { name: "RC List", path: "/rc/list" },
      ],
    },

    {
      name: "Car Management",
      icon: CarFront,
      submenu: [
        { name: "Add Car Data", path: "/car/create" },
        { name: "List Car Data", path: "/car/list" },
      ],
    },

    {
      name: "Sell",
      icon: TrendingUp,
      submenu: [
        { name: "Create Sell Letter", path: "/sell/create" },
        { name: "Sell Letter History", path: "/sell/history" },
        { name: "Sell Queries", path: "/sell-requests" },
        { name: "Advance Payments", path: "/advance-payments/create" },
        { name: "Payment History", path: "/advance-payments/history" },
      ],
    },
    {
      name: "Gallery Management",
      icon: Car,
      path: "/gallery",
    },
    {
      name: "Service",
      icon: Wrench,
      submenu: [
        { name: "Create Service Bill", path: "/service/create" },
        { name: "Service History", path: "/service/history" },
        { name: "Sell Queries", path: "/sell-requests" },
      ],
    },
    {
      name: "Staff",
      icon: Users,
      submenu: [
        { name: "Create Staff ID", path: "/staff/create" },
        { name: "Staff List", path: "/staff/list" },
      ],
    },
    {
      name: "Vehicle History",
      icon: Bike,
      path: "/bike-history",
    },
  ];
  // Generate a professional A4 PDF using pdf-lib, embedding logos and styled text
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
      let embeddedLogo, embeddedLogoBack;
      if (logoBytes) embeddedLogo = await pdfDoc.embedPng(logoBytes);
      if (logo1Bytes) embeddedLogoBack = await pdfDoc.embedPng(logo1Bytes);

      const { width, height } = page.getSize();

      // ---- Invoice-style layout to match provided image ----
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const small = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

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
        }
      );
      page.drawText(
        `Time : ${formatTime(formData.todayTime || formData.saleTime)}`,
        {
          x: invoiceX,
          y: headerY - 32,
          size: 10,
          font: fontNormal,
          color: rgb(0.06, 0.06, 0.06),
        }
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
        }
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
      const pCols = [50, pW - 150, 100];

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
                Number(formData.otherCharges || 0)
          )}`,
        ],
        ["", "Advance", `Rs. ${formatRupee(formData.advanceAmount || 0)}`],
        [
          "",
          "Balance",
          `Rs. ${formatRupee(
            formData.balanceAmount ||
              Number(formData.totalAmount || 0) -
                Number(formData.advanceAmount || 0)
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
        y: declY - 70,
        width: width - 80,
        height: 70,
        color: rgb(0.98, 0.98, 0.98),
      });
      page.drawText("Declaration:", {
        x: 46,
        y: declY - 12,
        size: 9,
        font: font,
        color: rgb(0.06, 0.06, 0.06),
      });
      const declText = formData.declaration || "";
      page.drawText(String(declText), {
        x: 46,
        y: declY - 28,
        size: 8.5,
        font: fontNormal,
        color: rgb(0.06, 0.06, 0.06),
      });

      // Footer notes area
      const notesY = declY - 90;
      page.drawRectangle({
        x: 40,
        y: notesY - 36,
        width: width - 80,
        height: 36,
        color: rgb(0.94, 0.94, 0.94),
      });
      page.drawText(
        "Kindly bring ID & Address Proof at the time of delivery. Note: Minimum 45 days period for documentation (RTO work). Vehicle is sold as is where condition no odometer guarantee. Car once sold will not be taken back or exchanged.",
        {
          x: 46,
          y: notesY - 20,
          size: 8,
          font: fontNormal,
          color: rgb(0.06, 0.06, 0.06),
        }
      );

      // Signature lines
      const sigY = 60;
      page.drawLine({
        start: { x: 60, y: sigY + 20 },
        end: { x: 200, y: sigY + 20 },
        thickness: 0.6,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText("*Authorised Signature", {
        x: 60,
        y: sigY + 6,
        size: 9,
        font: fontNormal,
      });

      page.drawLine({
        start: { x: width / 2 - 60, y: sigY + 20 },
        end: { x: width / 2 + 80, y: sigY + 20 },
        thickness: 0.6,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText("*Buyer's Signature", {
        x: width / 2 - 60,
        y: sigY + 6,
        size: 9,
        font: fontNormal,
      });

      page.drawLine({
        start: { x: width - 220, y: sigY + 20 },
        end: { x: width - 60, y: sigY + 20 },
        thickness: 0.6,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText("*Witness", {
        x: width - 200,
        y: sigY + 6,
        size: 9,
        font: fontNormal,
      });

      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (err) {
      console.error("PDF generation failed:", err);
      throw err;
    }
  };

  const handlePreview = async (language = "hindi") => {
    try {
      setIsSaving(true);
      const bytes = await generatePdfBytes(language);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPreviewPdf(url);
      setPreviewLanguage(language);
      setShowPreviewModal(true);
    } catch (err) {
      console.error("Preview error:", err);
      alert("Failed to generate preview PDF");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewAndDownload = async (language) => {
    try {
      setShowPreviewModal(false);
      const bytes = await generatePdfBytes(language);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const filename = `sellletter_${language}_${
        formData.registrationNumber || "document"
      }.pdf`;
      saveAs(blob, filename);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download PDF");
    }
  };
  const formatIndianAmountInWords = (amount) => {
    if (isNaN(amount)) return "(Zero Rupees)";

    const num = parseFloat(amount);
    if (num === 0) return "(Zero Rupees)";

    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "Ten",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const convertLessThanHundred = (n) => {
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + units[n % 10] : "")
      );
    };

    const convertLessThanThousand = (n) => {
      if (n < 100) return convertLessThanHundred(n);
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;
      return (
        units[hundred] +
        " Hundred" +
        (remainder !== 0 ? " and " + convertLessThanHundred(remainder) : "")
      );
    };

    const convert = (n) => {
      if (n === 0) return "Zero";

      let result = "";
      const crore = Math.floor(n / 10000000);
      if (crore > 0) {
        result += convertLessThanThousand(crore) + " Crore ";
        n = n % 10000000;
      }

      const lakh = Math.floor(n / 100000);
      if (lakh > 0) {
        result += convertLessThanThousand(lakh) + " Lakh ";
        n = n % 100000;
      }

      const thousand = Math.floor(n / 1000);
      if (thousand > 0) {
        result += convertLessThanThousand(thousand) + " Thousand ";
        n = n % 1000;
      }

      if (n > 0) {
        result += convertLessThanThousand(n);
      }

      return result.trim();
    };

    const amountInPaise = num / 100;
    return `(${convert(amountInPaise)} Only)`;
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };
  const formatKm = (val) => {
    const num = parseFloat(val.toString().replace(/,/g, ""));
    return isNaN(num)
      ? "0.00"
      : new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(num / 100);
  };

  const formatRupee = (val) => {
    const num = parseFloat(val.toString().replace(/,/g, ""));
    return isNaN(num)
      ? "0.00"
      : `${new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(num / 100)}`;
  };
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hour, minute] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleMenuClick = (menuName, path) => {
    setActiveMenu(menuName);
    const actualPath = typeof path === "function" ? path(user?.role) : path;
    navigate(actualPath);
  };
  const saveToDatabase = async () => {
    try {
      setIsSaving(true);
      const requiredFields = [
        "vehicleName",
        "vehicleModel",
        "vehicleColor",
        "registrationNumber",
        "chassisNumber",
        "engineNumber",
        "vehiclekm",
        "buyerName",
        "buyerFatherName",
        "buyerAddress",
        "buyerPhone",
        "buyerPhone2",
        "buyerAadhar",
        "saleAmount",
        "selleraadhar",
        "sellerphone",
      ];

      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        alert(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        setIsSaving(false);
        return false;
      }

      const response = await axios.post(
        `${API_BASE}/api/sell-letters`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        const saved = response.data;
        alert("Sell letter saved successfully!");

        // If an advance amount was entered, create an AdvancePayment record
        try {
          const adv = Number(formData.advanceAmount || 0);
          if (adv && adv > 0) {
            await axios.post(
              `${API_BASE}/api/advance-payments`,
              {
                sellLetter: saved._id,
                amount: adv,
                paymentMethod: formData.paymentMethod || "cash",
                note: "Advance recorded from Sell Letter",
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
          }
        } catch (err) {
          console.warn(
            "Advance payment creation failed:",
            err?.response?.data || err.message || err
          );
        }

        return saved;
      }
    } catch (error) {
      console.error("Error saving sell letter:", error);
      if (error.response) {
        // Handle server validation errors
        if (error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors)
            .map((err) => err.message)
            .join("\n");
          alert(`Validation errors:\n${errorMessages}`);
        } else {
          alert(error.response.data.message || "Failed to save sell letter.");
        }
      } else {
        alert("Failed to save sell letter. Please try again.");
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  const handleSaveAndDownload = async () => {
    try {
      setIsSaving(true);

      const existingLetter = await axios.get(
        `https://alfa-motors-5yfh.vercel.app/api/sell-letters/by-registration?registrationNumber=${formData.registrationNumber}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (existingLetter.data && existingLetter.data.length > 0) {
        const found = existingLetter.data[0];
        // If user entered an advance, create a payment linked to existing sell letter
        if (Number(formData.advanceAmount || 0) > 0) {
          try {
            await axios.post(
              `${API_BASE}/api/advance-payments`,
              {
                sellLetter: found._id,
                amount: Number(formData.advanceAmount),
                paymentMethod: formData.paymentMethod || "cash",
                note: "Advance recorded from Sell Letter (existing)",
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
          } catch (err) {
            console.warn(
              "Advance payment creation failed for existing letter:",
              err?.response?.data || err.message || err
            );
          }
        }
        setSavedLetterData(found);
        setShowLanguageModal(true);
      } else {
        const savedLetter = await saveToDatabase();
        if (savedLetter) {
          setSavedLetterData(savedLetter);
          setShowLanguageModal(true);
        }
      }
    } catch (error) {
      console.error("Error checking/saving sell letter:", error);
      let errorMessage = "Failed to process sell letter. Please try again.";

      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
        if (error.response.data.error) {
          errorMessage += ` (${error.response.data.error})`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  // NOTE: PDF drawing/positioning logic removed on purpose per new template decision.
  const handleInput = (e) => {
    const { name, value } = e.target;
    e.target.value = value.toUpperCase();
    handleChange(e);
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Removed old PDF-template fill functions. Preview/download now uses HTML preview.

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      {/* Sidebar component */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.contentPadding}>
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>Create Sell Letter</h1>
            <p style={styles.pageSubtitle}>
              Fill in the details to generate a vehicle purchase agreement
            </p>
          </div>

          <form className="form" style={styles.form}>
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <Car style={styles.sectionIcon} /> Vehicle Information
              </h2>
              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    Select from Inventory (optional)
                  </label>
                  <select
                    style={styles.formSelect}
                    onChange={handleSelectCar}
                    defaultValue=""
                  >
                    <option value="">-- Choose a car --</option>
                    {cars.map((c) => (
                      <option key={c._id} value={c._id}>
                        {`${c.make || c.brand || ""} ${
                          c.model || c.variant || ""
                        } ${c.registrationNumber || c.registrationNo || ""}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    Vehicle Brand
                  </label>
                  <input
                    type="text"
                    name="vehicleName"
                    value={formData.vehicleName}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    required
                    maxLength={30}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    required
                    maxLength={30}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    Vehicle Color
                  </label>
                  <input
                    type="text"
                    name="vehicleColor"
                    value={formData.vehicleColor}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    required
                    maxLength={30}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    required
                    maxLength={11}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    Chassis Number
                  </label>
                  <input
                    type="text"
                    name="chassisNumber"
                    value={formData.chassisNumber}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    required
                    maxLength={18}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    Engine Number
                  </label>
                  <input
                    type="text"
                    name="engineNumber"
                    value={formData.engineNumber}
                    onChange={handleChange}
                    style={styles.formInput}
                    required
                    maxLength={15}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    Vehicle KM
                  </label>
                  <input
                    type="text"
                    name="vehiclekm"
                    value={
                      formData.vehiclekm === ""
                        ? ""
                        : new Intl.NumberFormat("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(Number(formData.vehiclekm) / 100)
                    }
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        vehiclekm: rawValue,
                      }));
                    }}
                    style={styles.formInput}
                    placeholder="e.g. 36,000.00"
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Car style={styles.formIcon} />
                    Vehicle Condition
                  </label>
                  <select
                    name="vehicleCondition"
                    value={formData.vehicleCondition}
                    onChange={handleChange}
                    style={styles.formSelect}
                    required
                  >
                    <option value="running">Running</option>
                    <option value="notRunning">Not Running</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Seller Information Section - Updated */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <User style={styles.sectionIcon} /> Buyer Information
              </h2>
              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <User style={styles.formIcon} />
                    Buyer Name
                  </label>
                  <input
                    type="text"
                    name="buyerName"
                    value={formData.buyerName}
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
                    Buyer Father's Name
                  </label>
                  <input
                    type="text"
                    name="buyerFatherName"
                    value={formData.buyerFatherName}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                    required
                    maxLength={16}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <User style={styles.formIcon} />
                    Buyer Address
                  </label>
                  <input
                    type="text"
                    name="buyerAddress"
                    value={formData.buyerAddress}
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
                    Buyer Phone
                  </label>
                  <input
                    type="text"
                    name="buyerPhone"
                    value={formData.buyerPhone}
                    onChange={(e) => {
                      const rawValue = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 10);
                      setFormData((prev) => ({
                        ...prev,
                        buyerPhone: rawValue,
                      }));
                    }}
                    style={styles.formInput}
                    maxLength={10}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <User style={styles.formIcon} />
                    Buyer Alternate Phone
                  </label>
                  <input
                    type="text"
                    name="buyerPhone2"
                    value={formData.buyerPhone2}
                    onChange={(e) => {
                      const rawValue = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 10);
                      setFormData((prev) => ({
                        ...prev,
                        buyerPhone2: rawValue,
                      }));
                    }}
                    style={styles.formInput}
                    maxLength={10}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <User style={styles.formIcon} />
                    Buyer Aadhar
                  </label>
                  <input
                    type="text"
                    name="buyerAadhar"
                    value={formData.buyerAadhar}
                    onChange={(e) => {
                      let value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 12);
                      let formatted = value.match(/.{1,4}/g)?.join("-") || "";
                      setFormData((prev) => ({
                        ...prev,
                        buyerAadhar: formatted,
                      }));
                    }}
                    style={styles.formInput}
                    placeholder="1234-5678-9012"
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <User style={styles.formIcon} />
                    Witness Name
                  </label>
                  <input
                    type="text"
                    name="witnessName"
                    value={formData.witnessName}
                    onChange={handleChange}
                    style={styles.formInput}
                    required
                    maxLength={30}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <User style={styles.formIcon} />
                    Witness Phone
                  </label>
                  <input
                    type="text"
                    name="witnessPhone"
                    value={formData.witnessPhone}
                    onChange={(e) => {
                      const rawValue = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 10);
                      setFormData((prev) => ({
                        ...prev,
                        witnessPhone: rawValue,
                      }));
                    }}
                    style={styles.formInput}
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <IndianRupee style={styles.sectionIcon} /> Sale Details
              </h2>
              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Calendar style={styles.formIcon} />
                    Sale Date
                  </label>
                  <input
                    type="date"
                    name="saleDate"
                    value={formData.saleDate}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Clock style={styles.formIcon} />
                    Sale Time
                  </label>
                  <input
                    type="time"
                    name="saleTime"
                    value={formData.saleTime}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <IndianRupee style={styles.formIcon} />
                    Sale Amount (₹)
                  </label>
                  <input
                    type="text"
                    name="saleAmount"
                    value={
                      formData.saleAmount === ""
                        ? ""
                        : new Intl.NumberFormat("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(Number(formData.saleAmount) / 100)
                    }
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        saleAmount: rawValue,
                      }));
                    }}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <IndianRupee style={styles.formIcon} />
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    onInput={handleInput}
                    style={styles.formSelect}
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Upi</option>
                    <option value="bankTransfer">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Calendar style={styles.formIcon} />
                    Today's Date
                  </label>
                  <input
                    type="date"
                    name="todayDate"
                    value={formData.todayDate}
                    onChange={handleChange}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <Clock style={styles.formIcon} />
                    Today's Time
                  </label>
                  <input
                    type="time"
                    name="todayTime"
                    value={formData.todayTime}
                    onChange={handleChange}
                    style={styles.formInput}
                  />
                </div>
              </div>
            </div>

            {/* Invoice / Particulars Section */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <FileText style={styles.sectionIcon} /> Invoice / Particulars
              </h2>
              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Invoice No.</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Sale Value (₹)</label>
                  <input
                    type="text"
                    name="saleValue"
                    value={formData.saleValue}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setFormData((prev) => ({ ...prev, saleValue: raw }));
                    }}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Commission (₹)</label>
                  <input
                    type="text"
                    name="commission"
                    value={formData.commission}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setFormData((prev) => ({ ...prev, commission: raw }));
                    }}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>RTO Charges (₹)</label>
                  <input
                    type="text"
                    name="rtoCharges"
                    value={formData.rtoCharges}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setFormData((prev) => ({ ...prev, rtoCharges: raw }));
                    }}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Other Charges (₹)</label>
                  <input
                    type="text"
                    name="otherCharges"
                    value={formData.otherCharges}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setFormData((prev) => ({ ...prev, otherCharges: raw }));
                    }}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Advance (₹)</label>
                  <input
                    type="text"
                    name="advanceAmount"
                    value={formData.advanceAmount}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setFormData((prev) => ({ ...prev, advanceAmount: raw }));
                    }}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Balance (₹)</label>
                  <input
                    type="text"
                    name="balanceAmount"
                    value={formData.balanceAmount}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setFormData((prev) => ({ ...prev, balanceAmount: raw }));
                    }}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Declaration</label>
                  <textarea
                    name="declaration"
                    value={formData.declaration}
                    onChange={handleChange}
                    style={{ ...styles.formInput, height: "120px" }}
                  />
                </div>
              </div>
            </div>

            {/* Legal Terms Section - Updated */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <FileSignature style={styles.sectionIcon} /> Legal Terms
              </h2>
              <div style={styles.formGrid}>
                <div style={styles.formCheckboxField}>
                  <input
                    type="checkbox"
                    name="documentsVerified"
                    checked={formData.documentsVerified}
                    onChange={handleChange}
                    style={styles.formCheckbox}
                  />
                  <label style={styles.formCheckboxLabel}>
                    <CheckCircle style={styles.formIcon} />
                    All documents verified and satisfactory || सभी दस्तावेज
                    सत्यापित और संतोषजनक
                  </label>
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    <AlertCircle style={styles.formIcon} />
                    Note
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput("note")}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                      ...styles.formInput,
                      ...(focusedInput === "note" ? styles.inputFocused : {}),
                    }}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div style={styles.formActions}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <select
                  value={previewLanguage}
                  onChange={(e) => setPreviewLanguage(e.target.value)}
                  style={styles.formSelect}
                >
                  <option value="hindi">Hindi Preview</option>
                  <option value="english">English Preview</option>
                </select>
                <button
                  type="button"
                  onClick={() => handlePreview(previewLanguage)}
                  style={styles.previewButton}
                  disabled={isSaving}
                >
                  <FileText style={styles.buttonIcon} /> Preview
                </button>
              </div>
              <button
                type="button"
                onClick={handleSaveAndDownload}
                style={styles.downloadButton}
                disabled={isSaving}
              >
                <Download style={styles.buttonIcon} /> Save & Download
              </button>
            </div>
          </form>
        </div>
        {showLanguageModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>Select PDF Language</h3>
              <p style={styles.modalText}>
                Choose the language for your sell letter:
              </p>
              <div style={styles.modalButtons}>
                <button
                  style={styles.englishButton}
                  onClick={() => {
                    handlePreviewAndDownload("english");
                    setShowLanguageModal(false);
                  }}
                >
                  Download Preview (English)
                </button>
                <button
                  style={styles.hindiButton}
                  onClick={() => {
                    handlePreviewAndDownload("hindi");
                    setShowLanguageModal(false);
                  }}
                >
                  Download Preview (Hindi)
                </button>
              </div>
              <button
                style={styles.modalCloseButton}
                onClick={() => setShowLanguageModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {showPreviewModal && (
          <div style={styles.modalOverlay}>
            <div
              style={{
                ...styles.modalContent,
                maxWidth: "90%",
                width: "800px",
              }}
            >
              <h3 style={styles.modalTitle}>
                Document Preview -{" "}
                {previewLanguage === "hindi" ? "Hindi" : "English"}
              </h3>
              <div
                style={{ height: "70vh", width: "100%", marginBottom: "20px" }}
              >
                {previewPdf ? (
                  <iframe
                    src={previewPdf}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "1px solid #e2e8f0",
                    }}
                    title="PDF Preview"
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "#64748b",
                    }}
                  >
                    Loading preview...
                  </div>
                )}
              </div>
              <div style={styles.modalButtons}>
                <button
                  style={styles.englishButton}
                  onClick={() => handlePreviewAndDownload("english")}
                >
                  Download English PDF
                </button>
                <button
                  style={styles.hindiButton}
                  onClick={() => handlePreviewAndDownload("hindi")}
                >
                  Download Hindi PDF
                </button>
              </div>
              <button
                style={styles.modalCloseButton}
                onClick={() => setShowPreviewModal(false)}
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
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

  // Sidebar Styles
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

  // Main Content Styles
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
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: "1rem",
    color: "#64748b",
    margin: "8px 0 0 0",
    textAlign: "center",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "8px",
    width: "400px",
    maxWidth: "90%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#1e293b",
  },
  modalText: {
    marginBottom: "24px",
    color: "#64748b",
  },
  modalButtons: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
  },
  englishButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    ":hover": {
      backgroundColor: "#2563eb",
    },
  },
  hindiButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    ":hover": {
      backgroundColor: "#059669",
    },
  },
  modalCloseButton: {
    width: "100%",
    padding: "8px",
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#e2e8f0",
    },
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
  formIcon: {
    width: "18px",
    height: "18px",
    color: "#64748b",
  },
  formInput: {
    width: "83%",
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

  saveButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#059669",
    },
    ":disabled": {
      backgroundColor: "#6ee7b7",
      cursor: "not-allowed",
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
    ":focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      backgroundColor: "#ffffff",
    },
  },
  formCheckboxField: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  formCheckbox: {
    width: "16px",
    height: "16px",
    accentColor: "#3b82f6",
  },
  formCheckboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#334155",
    cursor: "pointer",
  },

  // Action Buttons
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    marginTop: "32px",
  },
  previewButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#ffffff",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#f1f5f9",
      borderColor: "#94a3b8",
    },
  },
  downloadButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#2563eb",
    },
  },
  buttonIcon: {
    width: "16px",
    height: "16px",
  },

  // Preview Mode Styles
  formPreviewContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    padding: "32px",
  },
  formPreviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    color: "#111827",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
  },
  previewActions: {
    display: "flex",
    gap: "16px",
  },
  pdfPreview: {
    minHeight: "500px",
    border: "1px dashed #d1d5db",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    color: "#6b7280",
  },
};

export default SellLetterForm;
