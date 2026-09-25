import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createProduct } from "../../../api/productApi";
import { getAllCategories } from "../../../api/categoryApi";
import { getAllSizes } from "../../../api/sizeApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faTimes,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

const Create = () => {
  const navigate = useNavigate();

  // State
  const [categories, setCategories] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    image: null,
    is_active: true,
  });

  // Selected sizes for this product: [{ size_id, size_name, price }]
  const [productSizes, setProductSizes] = useState([]);

  // Fetch Categories and Sizes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, sizeRes] = await Promise.all([
          getAllCategories({ status: 'active' }),
          getAllSizes({ status: 'active' }),
        ]);
        setCategories(catRes.data);
        setAvailableSizes(sizeRes.data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load initial data", "error");
      }
    };
    fetchData();
  }, []);

  // Input
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, image: file });
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Add Size Popup
  const handleAddSizePopup = async () => {
    if (availableSizes.length === 0) {
      return Swal.fire(
        "Notice",
        "No sizes available. Please create sizes first.",
        "info",
      );
    }

    // Filter out already-added AND inactive/deleted sizes
    const filteredSizes = availableSizes.filter(
      (s) => !productSizes.find((ps) => ps.size_id === s.size_id)
        && !s.deleted_at && s.is_active !== false,
    );

    if (filteredSizes.length === 0) {
      return Swal.fire(
        "Notice",
        "All available sizes have been added.",
        "info",
      );
    }

    const { value: formValues } = await Swal.fire({
      title: "Add Size & Price",
      html: `
        <div class="flex flex-col gap-4 text-left p-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Select Size</label>
            <select id="swal-size" class="input">
              ${filteredSizes
                .map((s) => `<option value="${s.size_id}">${s.size}</option>`)
                .join("")}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input id="swal-price" type="number" step="0.01" class="input" placeholder="0.00">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Add Size",
      confirmButtonColor: "#07564d",
      preConfirm: () => {
        const sizeId = document.getElementById("swal-size").value;
        const price = document.getElementById("swal-price").value;

        if (!sizeId || !price || price <= 0) {
          Swal.showValidationMessage(
            "Please select a size and enter a valid price",
          );
          return false;
        }
        return { size_id: parseInt(sizeId), price: parseFloat(price) };
      },
    });

    if (formValues) {
      const sizeObj = availableSizes.find(
        (s) => s.size_id === formValues.size_id,
      );
      setProductSizes([
        ...productSizes,
        {
          size_id: formValues.size_id,
          size_name: sizeObj.size,
          price: formValues.price,
        },
      ]);
    }
  };

  // Edit Size Popup
  const handleEditSizePopup = async (sizeId) => {
    const existing = productSizes.find((ps) => ps.size_id === sizeId);
    if (!existing) return;

    const { value: formValues } = await Swal.fire({
      title: `Update Price: ${existing.size_name}`,
      html: `
        <div class="flex flex-col gap-4 text-left p-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input id="swal-price" type="number" step="0.01" class="input" value="${existing.price}" placeholder="0.00">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update Price",
      confirmButtonColor: "#07564d",
      preConfirm: () => {
        const price = document.getElementById("swal-price").value;
        if (!price || price <= 0) {
          Swal.showValidationMessage("Please enter a valid price");
          return false;
        }
        return { price: parseFloat(price) };
      },
    });

    if (formValues) {
      setProductSizes(
        productSizes.map((ps) =>
          ps.size_id === sizeId ? { ...ps, price: formValues.price } : ps,
        ),
      );
    }
  };

  const removeSize = (sizeId) => {
    setProductSizes(productSizes.filter((s) => s.size_id !== sizeId));
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.category_id) {
      return Swal.fire("Error", "Please fill in Name and Category", "error");
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description || "");
      data.append("category_id", formData.category_id);

      if (formData.image) {
        data.append("image", formData.image);
      }
      data.append("is_active", formData.is_active ? 1 : 0);

      productSizes.forEach((ps, index) => {
        data.append(`sizes[${index}][size_id]`, ps.size_id);
        data.append(`sizes[${index}][price]`, ps.price);
      });
      if (productSizes.length === 0) {
        data.append('sizes', JSON.stringify([]));
      }

      // Call API
      await createProduct(data);

      await Swal.fire({
        icon: "success",
        title: "Created!",
        text: "Product added successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Failed to create product",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-semibold text-green-700 ">
            Add Product
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Info */}
            <div className="flex flex-col gap-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="custom-select w-full"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => {
                    let label = c.name;
                    if (c.deleted_at) label += " (Deleted)";
                    else if (!c.is_active) label += " (Inactive)";
                    return (
                      <option key={c.category_id} value={c.category_id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input w-full h-32 resize-none"
                  placeholder="Enter product description..."
                />
              </div>
            </div>

            {/* Right Column: Image & Sizes */}
            <div className="flex flex-col gap-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Product Image
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all cursor-pointer"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      JPG, PNG or WEBP. Max 2MB.
                    </p>
                  </div>
                  {preview && (
                    <div className="relative group">
                      <img
                        src={preview}
                        alt="preview"
                        className="w-24 h-24 object-cover rounded-xl border-2 border-green-100 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: null });
                          setPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FontAwesomeIcon icon={faTimes} size="xs" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="font-medium text-gray-600">Active Status</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    className="sr-only peer"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {formData.is_active ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>

              {/* Dynamic Sizes Section */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <label className="font-bold text-gray-700 uppercase tracking-wider text-sm">
                    Sizes & Prices
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSizePopup}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all shadow-sm"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Add Size</span>
                  </button>
                </div>

                {productSizes.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-400 text-sm italic">
                      No sizes added yet. Click "Add Size" to start.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {productSizes.map((ps) => (
                      <div
                        key={ps.size_id}
                        className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-fadeIn"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-700 font-bold text-xs">
                            {ps.size_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {ps.size_name}
                            </p>
                            <p className="text-xs text-green-600 font-semibold">
                              $ {ps.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditSizePopup(ps.size_id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-amber-500 transition-colors"
                            title="Edit Price"
                          >
                            <FontAwesomeIcon icon={faPen} size="sm" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSize(ps.size_id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove"
                          >
                            <FontAwesomeIcon icon={faTrash} size="sm" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-[#07564d] text-white rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-[#06463e] transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? "Creating Product..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Create;
