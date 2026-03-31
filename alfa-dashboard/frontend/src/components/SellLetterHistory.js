import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { FileText, Search, Download, Edit, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import logo from "../images/company.png";
import logo1 from "../images/okmotorback.png";

import AuthContext from "../context/AuthContext";
import Sidebar from "./Sidebar";

const EditSellLetterModal = ({ letter, onClose, onSave }) => {
  const [formData, setFormData] = useState(letter);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Edit Sell Letter</h2>
          <button onClick={onClose} style={modalStyles.closeButton}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={modalStyles.form}>
          {/* Vehicle Information */}
          <div style={modalStyles.formSection}>
            <h2 style={modalStyles.sectionTitle}>Vehicle Information</h2>
            <div style={modalStyles.formGrid}>
              <div style={modalStyles.formField}>
                <label style={modalStyles.formLabel}>Vehicle Name</label>
                <input
                  type="text"
                  name="vehicleName"
                  value={formData.vehicleName}
                  onChange={handleChange}
                  style={modalStyles.formInput}
                  required
                />
              </div>
              <div style={modalStyles.formField}>
                <label style={modalStyles.formLabel}>Vehicle Model</label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  style={modalStyles.formInput}
                  required
                />
              </div>
              <div style={modalStyles.formField}>
                <label style={modalStyles.formLabel}>Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  style={modalStyles.formInput}
                  required
                />
              </div>
              <div style={modalStyles.formField}>
                <label style={modalStyles.formLabel}>Vehicle Color</label>
                <input
                  type="text"
                  name="vehicleColor"
                  value={formData.vehicleColor}
                  onChange={handleChange}
                  style={modalStyles.formInput}
                  required
                />
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div style={modalStyles.formSection}>
            <h2 style={modalStyles.sectionTitle}>Buyer Information</h2>
            <div style={modalStyles.formGrid}>
              <div style={modalStyles.formField}>
                <label style={modalStyles.formLabel}>Buyer Name</label>
                <input
                  type="text"
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={handleChange}
                  style={modalStyles.formInput}
                  required
                />
              </div>
              <div style={modalStyles.formField}>
                <label style={modalStyles.formLabel}>Buyer Phone</label>
                <input
                  type="text"
                  name="buyerPhone"
                  value={formData.buyerPhone}
                  onChange={handleChange}
                  style={modalStyles.formInput}
                  required
                />
              </div>
              <div style={modalStyles.formField}>
                <label style={modalStyles.formLabel}>Sale Amount</label>
                <input
                  type="number"
                  name="saleAmount"
                  value={formData.saleAmount}
                  onChange={handleChange}
                  style={modalStyles.formInput}
                  required
                />
              </div>
            </div>
          </div>

          <div style={modalStyles.formActions}>
            <button
              type="button"
              onClick={onClose}
              style={modalStyles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" style={modalStyles.saveButton}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SellLetterHistory = () => {
  const { user } = useContext(AuthContext);
  const [activeMenu, setActiveMenu] = useState("Sell Letter History");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [sellLetters, setSellLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingLetter, setEditingLetter] = useState(null);
  const navigate = useNavigate();
  const hindiFieldPositions = {
    vehicleName: { x: 303, y: 696, size: 11 },
    vehicleModel: { x: 39, y: 674, size: 11 },
    vehicleColor: { x: 453, y: 696, size: 11 },
    registrationNumber: { x: 296, y: 674, size: 11 },
    chassisNumber: { x: 433, y: 674, size: 11 },
    engineNumber: { x: 87, y: 652, size: 11 },
    vehiclekm: { x: 308, y: 652, size: 11 },
    buyerName: { x: 40, y: 629, size: 11 },
    buyerFatherName: { x: 278, y: 629, size: 11 },
    buyerAddress: { x: 65, y: 606, size: 11 },
    buyerName1: { x: 102, y: 495, size: 11 },
    buyerName2: { x: 102, y: 451, size: 11 },
    saleDate: { x: 78, y: 584, size: 11 },
    saleTime: { x: 180, y: 584, size: 11 },
    saleAmount: { x: 273, y: 584, size: 11 },
    todayDate: { x: 210, y: 562, size: 11 },
    todayTime: { x: 324, y: 562, size: 11 },
    previousDate: { x: 243, y: 517, size: 11 },
    previousTime: { x: 363, y: 517, size: 11 },
    buyerPhone: { x: 85, y: 240, size: 11 },
    buyerPhone2: { x: 150, y: 240, size: 11 },
    buyerAadhar: { x: 111, y: 222, size: 11 },
    witnessName: { x: 70, y: 121, size: 11 },
    witnessPhone: { x: 70, y: 105, size: 11 },
    note: { x: 60, y: 33, size: 10 },
  };

  // English template field positions - copied from SellLetterPDF
  const englishFieldPositions = {
    vehicleName: { x: 284, y: 680, size: 11 },
    vehicleModel: { x: 93, y: 660, size: 11 },
    vehicleColor: { x: 447, y: 680, size: 11 },
    registrationNumber: { x: 392, y: 660, size: 11 },
    chassisNumber: { x: 54, y: 640, size: 11 },
    engineNumber: { x: 263, y: 640, size: 11 },
    vehiclekm: { x: 455, y: 640, size: 11 },
    buyerName: { x: 185 - 16, y: 619, size: 11 },
    buyerFatherName: { x: 445 - 16, y: 619, size: 11 },
    buyerAddress: { x: 123 - 16, y: 599, size: 11 },
    buyerName1: { x: 120 - 16, y: 517, size: 11 },
    buyerName2: { x: 286 - 16, y: 482, size: 11 },
    saleDate: { x: 70 - 16, y: 578, size: 11 },
    saleTime: { x: 181 - 16, y: 578, size: 11 },
    saleAmount: { x: 285 - 16, y: 578, size: 11 },
    todayDate: { x: 156 - 16, y: 557, size: 11 },
    todayTime: { x: 291 - 16, y: 557, size: 11 },
    previousDate: { x: 240 - 16, y: 538, size: 11 },
    previousTime: { x: 340 - 16, y: 538, size: 11 },
    buyerPhone: { x: 109, y: 282, size: 11 },
    buyerPhone2: { x: 115, y: 282, size: 11 },
    buyerAadhar: { x: 137, y: 263, size: 11 },
    witnessName: { x: 105, y: 135, size: 11 },
    witnessPhone: { x: 105, y: 116, size: 11 },
    note: { x: 70, y: 35, size: 10 },
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  useEffect(() => {
    const fetchSellLetters = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://alfa-motors-9bk6.vercel.app/api/sell-letters/my-letters?page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setSellLetters(response.data);

        setTotalPages(1);
      } catch (error) {
        console.error("Error fetching sell letters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellLetters();
  }, [currentPage]);

  const filteredLetters = sellLetters.filter(
    (letter) =>
      letter.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.registrationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      letter.buyerName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDownload = (letter) => {
    setSelectedLetter(letter);
    setShowLanguageModal(true);
  };

  const fillAndDownloadHindiPdf = async (letter) => {
    try {
      const templateUrl = "/templates/sellletter.pdf";
      const existingPdfBytes = await fetch(templateUrl).then((res) =>
        res.arrayBuffer(),
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Create vehicle invoice page
      const invoicePage = pdfDoc.addPage([595, 842]);
      await drawVehicleInvoice(invoicePage, pdfDoc, letter);

      function formatTime(timeString) {
        if (!timeString) return "";
        return timeString.slice(0, 5);
      }

      const formattedLetter = {
        ...letter,
        buyerName1: letter.buyerName,
        buyerName2: letter.buyerName,
        saleDate: formatDate(letter.saleDate),
        saleTime: formatTime(letter.saleTime),
        todayDate: formatDate(letter.todayDate || new Date()),
        todayTime: formatTime(letter.todayTime || "12:00"),
        previousDate: formatDate(
          letter.previousDate || letter.todayDate || new Date(),
        ),
        previousTime: formatTime(
          letter.previousTime || letter.todayTime || "12:00",
        ),
        sellerphone: letter.sellerphone || "9876543210",
        selleraadhar: letter.selleraadhar || "764465626571",
      };

      for (const [fieldName, position] of Object.entries(hindiFieldPositions)) {
        if (formattedLetter[fieldName]) {
          pdfDoc.getPages()[0].drawText(String(formattedLetter[fieldName]), {
            x: position.x,
            y: position.y,
            size: position.size,
            color: rgb(0, 0, 0),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sell_letter_hindi_${letter._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating Hindi PDF:", error);
      alert("Failed to generate Hindi PDF. Please try again.");
    }
  };

  const fillAndDownloadEnglishPdf = async (letter) => {
    try {
      const templateUrl = "/templates/englishsell.pdf";
      const existingPdfBytes = await fetch(templateUrl).then((res) =>
        res.arrayBuffer(),
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Create vehicle invoice page
      const invoicePage = pdfDoc.addPage([595, 842]);
      await drawVehicleInvoice(invoicePage, pdfDoc, letter);

      function formatTime(timeString) {
        if (!timeString) return "";
        return timeString.slice(0, 5);
      }

      const formattedLetter = {
        ...letter,
        buyerName1: letter.buyerName,
        buyerName2: letter.buyerName,
        saleDate: formatDate(letter.saleDate),
        saleTime: formatTime(letter.saleTime),
        todayDate: formatDate(letter.todayDate || new Date()),
        todayTime: formatTime(letter.todayTime || "12:00"),
        previousDate: formatDate(
          letter.previousDate || letter.todayDate || new Date(),
        ),
        previousTime: formatTime(
          letter.previousTime || letter.todayTime || "12:00",
        ),
        sellerphone: letter.sellerphone || "9876543210",
        selleraadhar: letter.selleraadhar || "764465626571",
      };

      // Fill sell letter fields
      for (const [fieldName, position] of Object.entries(
        englishFieldPositions,
      )) {
        if (formattedLetter[fieldName]) {
          pdfDoc.getPages()[0].drawText(String(formattedLetter[fieldName]), {
            x: position.x,
            y: position.y,
            size: position.size,
            color: rgb(0, 0, 0),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sell_letter_english_${letter._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating English PDF:", error);
      alert("Failed to generate English PDF. Please try again.");
    }
  };
  const drawVehicleInvoice = async (page, pdfDoc, letter) => {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const logoImageBytes = await fetch(logo).then((res) => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoImageBytes);

    const { width, height } = page.getSize();

    // Header
    const headerY = height - 40;
    page.drawImage(logoImage, {
      x: 40,
      y: headerY - 25,
      width: 80,
      height: 50,
    });

    page.drawText("ALFA MOTOR WORLD", {
      x: width / 2 - 120,
      y: headerY - 6,
      size: 22,
      font: boldFont,
      color: rgb(0.6, 0.06, 0.06),
    });
    page.drawText("SALE INVOICE", {
      x: width / 2 - 40,
      y: headerY - 28,
      size: 12,
      font: font,
      color: rgb(0.06, 0.06, 0.06),
    });

    const invoiceX = width - 160;
    page.drawText(`No. ${letter.invoiceNumber || ""}`, {
      x: invoiceX,
      y: headerY,
      size: 10,
      font: boldFont,
      color: rgb(0.8, 0.06, 0.06),
    });
    page.drawText(`Date : ${formatDate(letter.saleDate)}`, {
      x: invoiceX,
      y: headerY - 16,
      size: 10,
      font: font,
      color: rgb(0.06, 0.06, 0.06),
    });
    page.drawText(`Time : ${formatTime(letter.saleTime)}`, {
      x: invoiceX,
      y: headerY - 32,
      size: 10,
      font: font,
      color: rgb(0.06, 0.06, 0.06),
    });

    const addrY = headerY - 54;
    page.drawText(
      "# 97/2, Gottigere, Bannerghatta Main Road, Opp. D Mart, Bangalore - 560 083.",
      {
        x: 40,
        y: addrY,
        size: 9,
        font: font,
        color: rgb(0.06, 0.06, 0.06),
      },
    );

    let y = addrY - 28;
    const drawLinedField = (label, value) => {
      page.drawText(`${label}`, {
        x: 40,
        y,
        size: 10,
        font: font,
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
        font: font,
        color: rgb(0.06, 0.06, 0.06),
      });
      y -= 18;
    };

    drawLinedField("Name : ", letter.buyerName);
    drawLinedField("Address :", letter.buyerAddress);
    drawLinedField("Id Number:", letter.idNumber);
    drawLinedField("Contact No:", letter.contactNo || letter.buyerPhone);

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

    let cx = tableX;
    page.drawRectangle({
      x: tableX,
      y: tableY - 28,
      width: tableW,
      height: 28,
      color: rgb(0.95, 0.95, 0.95),
    });
    const headers = ["Reg. No.", "Make & Model", "Fuel", "Year", "Colour"];
    for (let i = 0; i < headers.length; i++) {
      page.drawText(headers[i], {
        x: cx + 4,
        y: tableY - 10,
        size: 9,
        font: font,
        color: rgb(0.06, 0.06, 0.06),
      });
      cx += colWidths[i];
      page.drawLine({
        start: { x: cx, y: tableY - 28 },
        end: { x: cx, y: tableY },
        thickness: 0.4,
        color: rgb(0.8, 0.8, 0.8),
      });
    }

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
      letter.registrationNumber,
      `${letter.vehicleName || ""} ${letter.vehicleModel || ""}`,
      letter.fuelType,
      letter.year,
      letter.vehicleColor,
    ];
    for (let i = 0; i < values.length; i++) {
      page.drawText(String(values[i] || ""), {
        x: vx + 4,
        y: valueY + 8,
        size: 9,
        font: font,
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

    let ceY = valueY - 26;
    page.drawText(`Chassis No : ${letter.chassisNumber || ""}`, {
      x: 40,
      y: ceY,
      size: 9,
      font: font,
      color: rgb(0.06, 0.06, 0.06),
    });
    page.drawText(`Engine No : ${letter.engineNumber || ""}`, {
      x: width / 2 + 20,
      y: ceY,
      size: 9,
      font: font,
      color: rgb(0.06, 0.06, 0.06),
    });

    const pX = 40;
    let pY = ceY - 28;
    const pW = width - 80;

    page.drawRectangle({
      x: pX,
      y: pY - 22,
      width: pW,
      height: 22,
      color: rgb(0.95, 0.95, 0.95),
    });
    page.drawText("Sl.No.", { x: pX + 6, y: pY - 6, size: 9, font: font });
    page.drawText("Particulars", { x: pX + 60, y: pY - 6, size: 9, font: font });
    page.drawText("Amount (Rs.)", {
      x: pX + pW - 90,
      y: pY - 6,
      size: 9,
      font: font,
    });

    const formatRupee = (amount) => {
      return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    const totalAmount =
      (Number(letter.saleValue) || Number(letter.saleAmount) || 0) +
      (Number(letter.commission) || 0) +
      (Number(letter.rtoCharges) || 0) +
      (Number(letter.otherCharges) || 0);
    const balanceAmount = totalAmount - (Number(letter.advanceAmount) || 0);

    const rows = [
      [
        "1",
        "Sale value",
        `Rs. ${formatRupee(letter.saleValue || letter.saleAmount || 0)}`,
      ],
      ["2", "Commission", `Rs. ${formatRupee(letter.commission || 0)}`],
      ["3", "RTO Charges", `Rs. ${formatRupee(letter.rtoCharges || 0)}`],
      ["4", "Others", `Rs. ${formatRupee(letter.otherCharges || 0)}`],
      ["", "Total", `Rs. ${formatRupee(totalAmount)}`],
      ["", "Advance", `Rs. ${formatRupee(letter.advanceAmount || 0)}`],
      ["", "Balance", `Rs. ${formatRupee(balanceAmount)}`],
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
      page.drawText(row[0], { x: pX + 8, y: pY - 6, size: 9, font: font });
      page.drawText(row[1], { x: pX + 60, y: pY - 6, size: 9, font: font });
      page.drawText(row[2], {
        x: pX + pW - 90,
        y: pY - 6,
        size: 9,
        font: font,
      });
      pY -= 22;
    }

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
      font: boldFont,
    });
    const declText =
      letter.declaration ||
      "I/We hereby agreed to take the delivery of the above mentioned vehicle by paying the balance amount on/before................................and also agreed that if I/We cancel the deal or fail to take the delivery of the vehicle for any reason before due date the advance amount will be completely forfeited. (and same will not be claimed by me/us)";
    page.drawText(declText, {
      x: 45,
      y: declY - 28,
      size: 8,
      font: font,
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
        font: font,
      });
      noteY -= 10;
    }

    let signY = declY - 130;
    page.drawText("*Authorised Signature", {
      x: 50,
      y: signY,
      size: 9,
      font: font,
    });
    page.drawText("*Buyer's Signature", {
      x: width / 2 - 50,
      y: signY,
      size: 9,
      font: font,
    });
    page.drawText("*Witness", { x: width - 100, y: signY, size: 9, font: font });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.slice(0, 5);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sell letter?")) {
      try {
        await axios.delete(
          `https://alfa-motors-9bk6.vercel.app/api/sell-letters/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setSellLetters(sellLetters.filter((letter) => letter._id !== id));
      } catch (error) {
        console.error("Error deleting sell letter:", error);
      }
    }
  };

  const handleSave = async (updatedLetter) => {
    try {
      const response = await axios.put(
        `https://alfa-motors-9bk6.vercel.app/api/sell-letters/${updatedLetter._id}`,
        updatedLetter,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setSellLetters(
        sellLetters.map((letter) =>
          letter._id === updatedLetter._id ? response.data : letter,
        ),
      );
      setEditingLetter(null);
    } catch (error) {
      console.error("Error updating sell letter:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Sell Letter History
          </h1>
          <div className="flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Vehicle Name</th>
                    <th className="py-3 px-6 text-left">Reg. Number</th>
                    <th className="py-3 px-6 text-left">Buyer Name</th>
                    <th className="py-3 px-6 text-center">Sale Date</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {filteredLetters.map((letter) => (
                    <tr
                      key={letter._id}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        {letter.vehicleName}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {letter.registrationNumber}
                      </td>
                      <td className="py-3 px-6 text-left">{letter.buyerName}</td>
                      <td className="py-3 px-6 text-center">
                        {formatDate(letter.saleDate)}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center">
                          <button
                            onClick={() => handleDownload(letter)}
                            className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors duration-200 mr-2"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          {user?.role === "admin" && (
                            <>
                              <button
                                onClick={() => handleEdit(letter)}
                                className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors duration-200 mr-2"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(letter._id)}
                                className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Select PDF Language
            </h2>
            <div className="flex justify-around">
              <button
                onClick={() => {
                  fillAndDownloadHindiPdf(selectedLetter);
                  setShowLanguageModal(false);
                }}
                className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors duration-300 text-lg"
              >
                Hindi PDF
              </button>
              <button
                onClick={() => {
                  fillAndDownloadEnglishPdf(selectedLetter);
                  setShowLanguageModal(false);
                }}
                className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors duration-300 text-lg"
              >
                English PDF
              </button>
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
      {editingLetter && (
        <EditSellLetterModal
          letter={editingLetter}
          onClose={() => setEditingLetter(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

const modalStyles = {
  overlay: {
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
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    width: "90%",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "16px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  formSection: {
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "16px",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "16px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
  },
  formLabel: {
    marginBottom: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#4b5563",
  },
  formInput: {
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    marginTop: "16px",
  },
  cancelButton: {
    padding: "10px 20px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    backgroundColor: "white",
    cursor: "pointer",
  },
  saveButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#3b82f6",
    color: "white",
    cursor: "pointer",
  },
};

export default SellLetterHistory;
