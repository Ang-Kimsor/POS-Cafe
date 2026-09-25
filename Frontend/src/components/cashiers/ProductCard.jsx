import { useState } from "react";
import { useDispatch } from "react-redux";
import { addItem } from "../../redux/slices/orderSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBasket } from "@fortawesome/free-solid-svg-icons";
import ImagePlaceholder from "../../assets/imageplaceholder.jpg";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  // product.sizes is a BelongsToMany, so price is in sz.pivot.price
  // Filter out sizes with price 0
  const sizes = (product.sizes || []).filter(
    (sz) => parseFloat(sz.pivot?.price) > 0,
  );
  const [selectedSize, setSelectedSize] = useState(
    sizes.length > 0 ? sizes[0] : null,
  );

  const getPrice = (sz) => {
    if (!sz) return 0;
    // price lives in pivot table
    return parseFloat(sz.pivot?.price ?? 0);
  };

  const handleAddToOrder = () => {
    if (!selectedSize) return;
    const price = getPrice(selectedSize);
    dispatch(
      addItem({
        id: `${product.product_id}-${selectedSize.size_id}`,
        name: `${product.name} (${selectedSize.size})`,
        price,
        image: product.image_url,
      }),
    );
  };

  return (
    <div className="h-fit bg-white border border-gray-100 shadow-sm hover:shadow-md transition p-3 flex flex-col justify-between rounded-xl">
      {/* IMAGE */}
      <div className="w-full aspect-square overflow-hidden rounded-lg bg-gray-50">
        <img
          src={
            product.image_url || ImagePlaceholder
          }
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* INFO */}
      <div className="mt-3 flex flex-col gap-1">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-1">
          {product.name}
        </h3>

        {/* SIZE SELECTION - Show only if multiple sizes exist */}
        {sizes.length > 0 && (
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {sizes.map((sz) => (
              <button
                key={sz.size_id}
                onClick={() => setSelectedSize(sz)}
                className={`h-7 px-2 text-xs rounded-md border transition-all font-medium ${selectedSize?.size_id === sz.size_id
                  ? "bg-teal-500 text-white border-teal-500"
                  : "bg-white text-gray-500 border-gray-200 hover:border-teal-300"
                  }`}
              >
                {sz.size}
              </button>
            ))}
          </div>
        )}

        {/* PRICE */}
        <div className="flex justify-between items-center mt-1">
          {sizes.length > 0 ? (
            <span className="text-sm sm:text-base font-bold text-teal-600">
              ${getPrice(selectedSize).toFixed(2)}
            </span>
          ) : (
            <span className="text-xs sm:text-sm font-semibold text-red-500">
              No unit price found
            </span>
          )}
        </div>
      </div>

      {/* ADD TO CART */}
      <div className="mt-2">
        <button
          onClick={handleAddToOrder}
          disabled={!selectedSize}
          className={`w-full py-2 text-sm font-semibold rounded-lg transition shadow-sm ${selectedSize
            ? "bg-teal-500 hover:bg-teal-600 text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          <FontAwesomeIcon icon={faShoppingBasket} className="mr-2" />
          Add to Order
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
