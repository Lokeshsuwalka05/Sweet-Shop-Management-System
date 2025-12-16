import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Candy, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

const Admin = () => {
  const [sweets, setSweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    ingredients: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchSweets();
  }, [isAdmin, navigate]);

  const fetchSweets = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/sweets");
      setSweets(response.data.sweets);
    } catch (err) {
      setError("Failed to load sweets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
      ingredients: "",
      imageUrl: "",
    });
    setEditingSweet(null);
    setShowForm(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        ingredients: formData.ingredients
          ? formData.ingredients.split(",").map((i) => i.trim())
          : [],
      };
      await api.post("/api/sweets", data);
      await fetchSweets();
      resetForm();
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create sweet");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        ingredients: formData.ingredients
          ? formData.ingredients.split(",").map((i) => i.trim())
          : [],
      };
      await api.put(`/api/sweets/${editingSweet._id}`, data);
      await fetchSweets();
      resetForm();
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update sweet");
    }
  };

  const handleEdit = (sweet) => {
    setEditingSweet(sweet);
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      stock: sweet.stock.toString(),
      description: sweet.description || "",
      ingredients: sweet.ingredients?.join(", ") || "",
      imageUrl: sweet.imageUrl || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sweet?")) return;

    try {
      await api.delete(`/api/sweets/${id}`);
      await fetchSweets();
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete sweet");
    }
  };

  return (
    <motion.div
      style={{ background: "linear-gradient(135deg, #ff9a9e, #fad0c4)" }}
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate("/")} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
              <div className="flex items-center gap-2">
                <Candy className="h-8 w-8 text-[#ff9a9e]" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Panel
                </h1>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="hover:brightness-95 bg-[linear-gradient(135deg,_#ff9a9e,_#fad0c4)]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sweet
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingSweet ? "Edit Sweet" : "Create New Sweet"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={editingSweet ? handleUpdate : handleCreate}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ingredients">
                    Ingredients (comma-separated)
                  </Label>
                  <Input
                    id="ingredients"
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleInputChange}
                    placeholder="Sugar, Milk, Flour"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="hover:brightness-95 bg-[linear-gradient(135deg,_#ff9a9e,_#fad0c4)]"
                  >
                    {editingSweet ? "Update Sweet" : "Create Sweet"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sweets List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading sweets...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sweets.map((sweet) => (
              <Card key={sweet._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{sweet.name}</h3>
                      <p className="text-sm text-gray-600">{sweet.category}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="font-medium">₹{sweet.price}</span>
                        <span
                          className={
                            sweet.stock > 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          Stock: {sweet.stock}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(sweet)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(sweet._id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </motion.div>
  );
};

export default Admin;
