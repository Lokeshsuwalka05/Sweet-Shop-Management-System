import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Candy, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";

const Purchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sweet, setSweet] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSweet();
  }, [id]);

  const fetchSweet = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/sweets/${id}`);
      setSweet(response.data);
    } catch (err) {
      setError("Failed to load sweet details");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsPurchasing(true);

    try {
      const response = await api.post(`/api/sweets/${id}/purchase`, {
        quantity: parseInt(quantity),
      });
      setSuccess(`Successfully purchased ${quantity} ${sweet.name}!`);
      setSweet(response.data.sweet);
      setQuantity(1);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Purchase failed. Please try again."
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, Math.min(value, sweet?.stock || 1)));
  };

  if (isLoading) {
    return (
      <motion.div
        style={{ background: "linear-gradient(135deg, #ff9a9e, #fad0c4)" }}
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}   
      >
        <p className="text-gray-600">Loading...</p>
      </motion.div>
    );
  }

  if (!sweet) {
    return (
      <div
        style={{ background: "linear-gradient(135deg, #ff9a9e, #fad0c4)" }}
        className="min-h-screen flex items-center justify-center"
      >
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Sweet not found</p>
            <Button onClick={() => navigate("/")}>Back to Shop</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPrice = (sweet.price * quantity).toFixed(2);

  return (
    <div
      style={{ background: "linear-gradient(135deg, #ff9a9e, #fad0c4)" }}
      className="min-h-screen"
    >
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button onClick={() => navigate("/")} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <Card className="overflow-hidden">
            <div className="h-96 bg-[linear-gradient(135deg,_#ff9a9e,_#fad0c4)] flex items-center justify-center">
              {sweet.imageUrl ? (
                <img
                  src={sweet.imageUrl}
                  alt={sweet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Candy className="h-32 w-32 text-[#ff9a9e]" />
              )}
            </div>
          </Card>

          {/* Purchase Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{sweet.name}</CardTitle>
                <CardDescription className="text-lg">
                  {sweet.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sweet.description && (
                  <p className="text-gray-700">{sweet.description}</p>
                )}

                {sweet.ingredients && sweet.ingredients.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">
                      Ingredients:
                    </h3>
                    <p className="text-sm text-gray-600">
                      {sweet.ingredients.join(", ")}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-[linear-gradient(135deg,_#ff9a9e,_#fad0c4)]">
                      ₹{sweet.price}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        sweet.stock > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {sweet.stock > 0
                        ? `${sweet.stock} available`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-600">
                    {success}
                  </div>
                )}

                <form onSubmit={handlePurchase} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={sweet.stock}
                      value={quantity}
                      onChange={handleQuantityChange}
                      disabled={sweet.stock === 0}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="bg-clip-text text-transparent bg-[linear-gradient(135deg,_#ff9a9e,_#fad0c4)]">
                        ₹{totalPrice}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={sweet.stock === 0 || isPurchasing}
                    className="w-full hover:brightness-95 text-lg py-6 bg-[linear-gradient(135deg,_#ff9a9e,_#fad0c4)]"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {isPurchasing ? "Processing..." : "Purchase Now"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Purchase;
