import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Car, TrendingUp, Upload, X, Camera } from "lucide-react";
import Sidebar from "./Sidebar";
import {
  categories,
  brandsByCategory,
  getModels,
  fuelTypes,
  toLabel,
} from "../data/vehicleData";

const API_BASE = (function () {
  const host = window.location.hostname;
  if (host === "localhost" || host.startsWith("127."))
    return "https://alfa-motors-9bk6.vercel.app";
  return "https://alfa-motors-9bk6.vercel.app";
})();

const EditCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [makeSelection, setMakeSelection] = useState("");
  const [modelSelection, setModelSelection] = useState("");
  const [carData, setCarData] = useState({
    make: "",
    model: "",
    variant: "",
    fuelType: "Petrol",
    modelYear: "",
    registrationYear: "",
    color: "",
    chassisNo: "",
    engineNo: "",
    kmDriven: "",
    ownership: "1st Own",
    daysOld: "",
    buyingPrice: "",
    quotingPrice: "",
    sellingPrice: "",
    cover: null,
    interior: [],
    exterior: [],
    status: "Available",
    sold: {},
  });

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/cars/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const car = response.data.data || response.data;

        let rawPhotos = car.photos || [];
        if (typeof rawPhotos === "string") {
          try {
            rawPhotos = JSON.parse(rawPhotos);
          } catch (e) {
            console.error("Error parsing photos JSON:", e);
            rawPhotos = [];
          }
        }

        let cover = null;
        let interior = [];
        let exterior = [];

        if (
          rawPhotos &&
          typeof rawPhotos === "object" &&
          !Array.isArray(rawPhotos)
        ) {
          cover = rawPhotos.cover || null;
          interior = Array.isArray(rawPhotos.interior)
            ? rawPhotos.interior
            : [];
          exterior = Array.isArray(rawPhotos.exterior)
            ? rawPhotos.exterior
            : [];
        } else if (Array.isArray(rawPhotos)) {
          cover = rawPhotos[0] || null;
          exterior = rawPhotos.slice(1);
        }

        const loadedMake = car.make || "";
        const loadedModel = car.model || "";
        const loadedCategory = car.category || "";

        
        const knownBrands = loadedCategory
          ? brandsByCategory[loadedCategory] || []
          : Object.values(brandsByCategory).flat();
        const makeInList = knownBrands.includes(loadedMake);
        const initialMakeSelection = loadedMake
          ? makeInList ? loadedMake : "Other_Brand"
          : "";

        const knownModels = loadedCategory
          ? getModels(loadedCategory, initialMakeSelection !== "Other_Brand" ? loadedMake : "")
          : [];
        const modelInList = knownModels.includes(loadedModel);
        const initialModelSelection = loadedModel
          ? modelInList ? loadedModel : "Other_Model"
          : "";

        setMakeSelection(initialMakeSelection);
        setModelSelection(initialModelSelection);

        setCarData({
          category: loadedCategory,
          make: loadedMake,
          model: loadedModel,
          variant: car.variant || "",
          fuelType: car.fuelType || "Petrol",
          modelYear: car.modelYear || "",
          registrationYear: car.registrationYear || "",
          color: car.color || "",
          chassisNo: car.chassisNo || "",
          engineNo: car.engineNo || "",
          kmDriven: car.kmDriven || "",
          ownership: car.ownership || "1st Own",
          daysOld: car.daysOld || "",
          buyingPrice: car.buyingPrice || "",
          quotingPrice: car.quotingPrice || "",
          sellingPrice: car.sellingPrice || "",
          cover,
          interior,
          exterior,
          status: car.status || "Available",
          sold: car.sold || {},
          rcSubmittedDate: car.rcSubmittedDate || "",
          rcReceivedDate: car.rcReceivedDate || "",
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching car data:", error);
        alert("Failed to load car data.");
        navigate("/car/list");
      }
    };

    fetchCarData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCarData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setCarData((prev) => ({ ...prev, category: cat, make: "", model: "" }));
    setMakeSelection("");
    setModelSelection("");
  };

  const handleMakeChange = (e) => {
    const val = e.target.value;
    setMakeSelection(val);
    setModelSelection("");
    setCarData((prev) => ({
      ...prev,
      make: val === "Other_Brand" ? "" : val,
      model: "",
    }));
  };

  const handleModelChange = (e) => {
    const val = e.target.value;
    setModelSelection(val);
    setCarData((prev) => ({
      ...prev,
      model: val === "Other_Model" ? "" : val,
    }));
  };

  const handleFileUpload = async (files, category) => {
    if (files.length === 0) return;

    if (category === "cover" && files.length > 1) {
      alert("Only 1 cover photo allowed.");
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      for (let file of files) {
        formData.append(category, file);
      }

      const response = await axios.put(
        `${API_BASE}/api/cars/${id}/photos`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const car = response.data.data;
      if (
        car.photos &&
        typeof car.photos === "object" &&
        !Array.isArray(car.photos)
      ) {
        setCarData((prev) => ({
          ...prev,
          cover: car.photos.cover,
          interior: car.photos.interior,
          exterior: car.photos.exterior,
        }));
      }

      alert(`Photos uploaded to ${category} successfully!`);
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Failed to upload photos.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePhoto = async (photoToDelete, category) => {
    try {
      const filename = photoToDelete.split("/").pop();

      await axios.delete(`${API_BASE}/api/cars/${id}/photo`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: { filename: filename },
      });

      setCarData((prev) => {
        if (category === "cover") return { ...prev, cover: null };
        return {
          ...prev,
          [category]: prev[category].filter((photo) => photo !== photoToDelete),
        };
      });

      alert("Photo deleted successfully!");
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo.");
    }
  };

  const buildImageUrl = (file) => {
    if (!file) return "/assets/placeholder.png";
    if (file.startsWith("http")) return file;
    return `${API_BASE}/carimages/${file.replace("carimages/", "")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updateData = {
        ...carData,
        modelYear: Number(carData.modelYear),
        registrationYear: Number(carData.registrationYear),
        kmDriven: Number(carData.kmDriven),
        daysOld: Number(carData.daysOld),
        buyingPrice: Number(carData.buyingPrice),
        quotingPrice: Number(carData.quotingPrice),
        sellingPrice: Number(carData.sellingPrice),
        photos: {
          cover: carData.cover,
          interior: carData.interior,
          exterior: carData.exterior,
        },
        rcSubmittedDate: carData.rcSubmittedDate || null,
        rcReceivedDate: carData.rcReceivedDate || null,
      };

      await axios.put(`${API_BASE}/api/cars/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Car updated successfully!");
      navigate("/car/list");
    } catch (error) {
      console.error("Error updating car:", error);
      alert("Failed to update car.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderPhotoCategory = (photos, category, title) => {
    const photoArray = Array.isArray(photos) ? photos : photos ? [photos] : [];
    return (
      <div style={styles.categoryContainer}>
        <div style={styles.categoryHeader}>
          <h3 style={styles.categoryTitle}>{title}</h3>
          <label style={styles.uploadBtnSmall}>
            <Upload size={14} />
            Upload
            <input
              type="file"
              accept="image/*"
              multiple={category !== "cover"}
              style={{ display: "none" }}
              onChange={(e) =>
                handleFileUpload(Array.from(e.target.files), category)
              }
            />
          </label>
        </div>
        <div style={styles.photoGrid}>
          {photoArray.map((photo, index) => (
            <div key={index} style={styles.photoCard}>
              <img
                src={buildImageUrl(photo)}
                style={styles.photoImage}
                alt=""
              />
              <button
                type="button"
                onClick={() => handleDeletePhoto(photo, category)}
                style={styles.deleteBtn}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {photoArray.length === 0 && (
            <div style={styles.emptyPhoto}>No photos uploaded</div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading)
    return <div style={styles.loading}>Loading Vehicle Data...</div>;

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1>Edit Vehicle Details</h1>
          <p>Update information and manage categorized photos</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Car size={20} />
              <h2>Vehicle Information</h2>
            </div>
            <div style={styles.grid}>
              {}
              <div style={styles.field}>
                <label>Category</label>
                <select
                  name="category"
                  value={carData.category}
                  onChange={handleCategoryChange}
                  style={styles.select}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{toLabel(cat)}</option>
                  ))}
                </select>
              </div>

              {}
              <div style={styles.field}>
                <label>Make *</label>
                <select
                  value={makeSelection}
                  onChange={handleMakeChange}
                  required
                  style={styles.select}
                >
                  <option value="">
                    {carData.category ? "Select Make" : "Select a category first"}
                  </option>
                  {(brandsByCategory[carData.category] || []).map((b) => (
                    <option key={b} value={b}>{toLabel(b)}</option>
                  ))}
                </select>
                {makeSelection === "Other_Brand" && (
                  <input
                    name="make"
                    value={carData.make}
                    onChange={handleChange}
                    placeholder="Enter make name"
                    style={{ marginTop: 6 }}
                  />
                )}
              </div>

              {}
              <div style={styles.field}>
                <label>Model *</label>
                <select
                  value={modelSelection}
                  onChange={handleModelChange}
                  required
                  disabled={!makeSelection || makeSelection === "Other_Brand"}
                  style={styles.select}
                >
                  <option value="">
                    {makeSelection && makeSelection !== "Other_Brand"
                      ? "Select Model"
                      : "Select a make first"}
                  </option>
                  {getModels(carData.category, makeSelection).map((m) => (
                    <option key={m} value={m}>{toLabel(m)}</option>
                  ))}
                </select>
                {modelSelection === "Other_Model" && (
                  <input
                    name="model"
                    value={carData.model}
                    onChange={handleChange}
                    placeholder="Enter model name"
                    style={{ marginTop: 6 }}
                  />
                )}
              </div>

              {}
              <div style={styles.field}>
                <label>Variant</label>
                <input
                  name="variant"
                  value={carData.variant}
                  onChange={handleChange}
                  placeholder="e.g., GL, LXI, VXI"
                />
              </div>

              {}
              <div style={styles.field}>
                <label>Fuel Type</label>
                <select
                  name="fuelType"
                  value={carData.fuelType}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select Fuel Type</option>
                  {fuelTypes.map((f) => (
                    <option key={f} value={f}>{toLabel(f)}</option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label>Model Year</label>
                <input
                  type="number"
                  name="modelYear"
                  value={carData.modelYear}
                  onChange={handleChange}
                />
              </div>
              <div style={styles.field}>
                <label>Registration Year</label>
                <input
                  type="number"
                  name="registrationYear"
                  value={carData.registrationYear}
                  onChange={handleChange}
                />
              </div>
              <div style={styles.field}>
                <label>Color</label>
                <input
                  name="color"
                  value={carData.color}
                  onChange={handleChange}
                />
              </div>
              <div style={styles.field}>
                <label>Ownership</label>
                <select
                  name="ownership"
                  value={carData.ownership}
                  onChange={handleChange}
                >
                  <option value="1st Own">1st Own</option>
                  <option value="2nd Own">2nd Own</option>
                  <option value="3rd Own">3rd Own</option>
                  <option value="4th Own">4th Own</option>
                </select>
              </div>
              <div style={styles.field}>
                <label>KM Driven</label>
                <input
                  type="number"
                  name="kmDriven"
                  value={carData.kmDriven}
                  onChange={handleChange}
                />
              </div>
              <div style={styles.field}>
                <label>Status</label>
                <select
                  name="status"
                  value={carData.status}
                  onChange={handleChange}
                >
                  <option value="Available">Available</option>
                  <option value="Sold Out">Sold Out</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
              </div>
              <div style={styles.field}>
                <label>RC Submitted Date</label>
                <input
                  type="date"
                  name="rcSubmittedDate"
                  value={
                    carData.rcSubmittedDate
                      ? carData.rcSubmittedDate.split("T")[0]
                      : ""
                  }
                  onChange={handleChange}
                />
              </div>
              <div style={styles.field}>
                <label>RC Received Date</label>
                <input
                  type="date"
                  name="rcReceivedDate"
                  value={
                    carData.rcReceivedDate
                      ? carData.rcReceivedDate.split("T")[0]
                      : ""
                  }
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <TrendingUp size={20} />
              <h2>Pricing (₹)</h2>
            </div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label>Buying Price</label>
                <input
                  type="number"
                  name="buyingPrice"
                  value={carData.buyingPrice}
                  onChange={handleChange}
                />
              </div>
              <div style={styles.field}>
                <label>Quoting Price</label>
                <input
                  type="number"
                  name="quotingPrice"
                  value={carData.quotingPrice}
                  onChange={handleChange}
                />
              </div>
              <div style={styles.field}>
                <label>Selling Price</label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={carData.sellingPrice}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Camera size={20} />
              <h2>Vehicle Photos</h2>
            </div>
            {renderPhotoCategory(
              carData.cover,
              "cover",
              "Cover Photo (Inventory Card)",
            )}
            {renderPhotoCategory(
              carData.interior,
              "interior",
              "Interior Photos (4-5 recommended)",
            )}
            {renderPhotoCategory(
              carData.exterior,
              "exterior",
              "Exterior Photos (3-4 recommended)",
            )}
          </div>

          <div style={styles.actions}>
            <button type="submit" disabled={isSaving} style={styles.saveBtn}>
              {isSaving ? "Saving Changes..." : "Update Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
  },
  main: { flex: 1, padding: "40px" },
  header: { marginBottom: "32px" },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "1000px",
  },
  section: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
  },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  select: { padding: "6px 8px", borderRadius: "4px", border: "1px solid #d1d5db", fontSize: "14px" },
  categoryContainer: {
    marginBottom: "24px",
    padding: "16px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
  },
  categoryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  categoryTitle: { fontSize: "14px", fontWeight: "600", color: "#374151" },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: "12px",
  },
  photoCard: {
    position: "relative",
    aspectRatio: "1",
    borderRadius: "6px",
    overflow: "hidden",
    border: "1px solid #ddd",
  },
  photoImage: { width: "100%", height: "100%", objectFit: "cover" },
  deleteBtn: {
    position: "absolute",
    top: "4px",
    right: "4px",
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    padding: "4px",
    cursor: "pointer",
  },
  uploadBtnSmall: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  emptyPhoto: {
    fontSize: "12px",
    color: "#9ca3af",
    gridColumn: "1/-1",
    textAlign: "center",
    padding: "20px",
  },
  saveBtn: {
    backgroundColor: "#10b981",
    color: "#fff",
    padding: "16px 32px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    alignSelf: "flex-end",
  },
  loading: {
    display: "flex",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
};

export default EditCar;
