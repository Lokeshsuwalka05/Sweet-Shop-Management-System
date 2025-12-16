import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShoppingCart, Candy, LogOut } from "lucide-react";
import { motion } from "motion/react";

const Sweets = () => {
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSweets();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, category, minPrice, maxPrice]);

  const fetchSweets = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/sweets");
      setSweets(response.data.sweets || []);
      setFilteredSweets(response.data.sweets || []);
    } catch (err) {
      setError("Failed to load sweets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      // If no filters, load all
      const hasQuery =
        (searchTerm && searchTerm.trim().length > 0) ||
        (category && category.trim().length > 0) ||
        (minPrice && minPrice !== "") ||
        (maxPrice && maxPrice !== "");

      setIsLoading(true);
      setError("");

      if (!hasQuery) {
        const response = await api.get("/api/sweets");
        setSweets(response.data.sweets || []);
        setFilteredSweets(response.data.sweets || []);
        return;
      }

      const params = {};
      if (searchTerm) params.name = searchTerm.trim();
      if (category) params.category = category.trim();
      if (minPrice !== "") params.minPrice = Number(minPrice);
      if (maxPrice !== "") params.maxPrice = Number(maxPrice);

      const response = await api.get("/api/sweets/search", { params });
      setSweets(response.data.sweets || []);
      setFilteredSweets(response.data.sweets || []);
    } catch (err) {
      setError("Failed to search sweets");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = (sweetId) => {
    navigate(`/purchase/${sweetId}`);
  };

  const categories = [...new Set(sweets.map((sweet) => sweet.category))];

  return (
    <motion.div
      style={{ background: "linear-gradient(135deg, #ff9a9e, #fad0c4)" }}
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search sweets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="sm:w-32"
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="sm:w-32"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Button
              onClick={handleSearch}
              className="hover:brightness-95 bg-[linear-gradient(135deg,_#ff9a9e,_#fad0c4)]"
            >
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setCategory("");
                setMinPrice("");
                setMaxPrice("");
                fetchSweets();
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading sweets...</p>
          </div>
        )}

        {/* Sweets Grid */}
        {!isLoading && filteredSweets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No sweets found</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSweets.map((sweet) => (
            <Card
              key={sweet._id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-[linear-gradient(135deg,_#ff9a9e,_#fad0c4)] flex items-center justify-center">
                {sweet.imageUrl ? (
                  <img
                    src={sweet.imageUrl}
                    alt={sweet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Candy className="h-16 w-16 text-[#ff9a9e]" />
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {sweet.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{sweet.category}</p>
                {sweet.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {sweet.description}
                  </p>
                )}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-[linear-gradient(135deg,_#ff9a9e,_#fad0c4)]">
                    ₹{sweet.price}
                  </span>
                  <span
                    className={`text-sm ${
                      sweet.stock > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {sweet.stock > 0
                      ? `${sweet.stock} in stock`
                      : "Out of stock"}
                  </span>
                </div>
                <Button
                  onClick={() => handlePurchase(sweet._id)}
                  disabled={sweet.stock === 0}
                  className="w-full"
                  style={{
                    background: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {sweet.stock > 0 ? "Purchase" : "Out of Stock"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </motion.div>
  );
};

export default Sweets;
