import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { removeItem, updateQuantity } from "../../redux/slices/orderSlice";

const OrderList = ({ id, length, item }) => {
  const dispatch = useDispatch();

  const handleIncrement = () => {
    dispatch(updateQuantity({ id: item.id, qty: item.qty + 1 }));
  };

  const handleDecrement = () => {
    if (item.qty > 1) {
      dispatch(updateQuantity({ id: item.id, qty: item.qty - 1 }));
    }
  };

  const handleRemove = () => {
    dispatch(removeItem(item.id));
  };

  return (
    <div
      className={`flex justify-between items-center ${id + 1 != length ? "border-b border-black/10" : ""} pb-3`}
    >
      <div className="flex items-center gap-3">
        <img
          src={item.image || "https://placehold.co/48x48?text=Item"}
          alt={item.name}
          className="w-12 h-12 rounded-lg object-cover"
        />

        <div>
          <p className="font-medium text-sm">{item.name}</p>
          <p className="text-sm text-gray-500">
            ${typeof item.price === "number" ? item.price.toFixed(2) : "0.00"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          className={`w-6 h-6 flex items-center justify-center rounded border ${item.qty > 1
              ? "text-gray-500 border-gray-300 hover:bg-gray-100"
              : "text-gray-300 border-gray-200 cursor-not-allowed"
            }`}
        >
          <FontAwesomeIcon icon={faMinus} className="text-[10px]" />
        </button>
        <input
          type="number"
          min="1"
          value={item.qty}
          onChange={(e) => {
            const val = e.target.value === "" ? "" : parseInt(e.target.value);
            if (val === "" || (!isNaN(val) && val >= 1)) {
              dispatch(updateQuantity({ id: item.id, qty: val }));
            }
          }}
          onBlur={(e) => {
            if (e.target.value === "" || parseInt(e.target.value) < 1) {
              dispatch(updateQuantity({ id: item.id, qty: 1 }));
            }
          }}
          className="w-8 text-center text-sm font-bold bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={handleIncrement}
          className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100"
        >
          <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
        </button>
        <button
          onClick={handleRemove}
          className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 ml-1"
        >
          <FontAwesomeIcon icon={faTrash} className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default OrderList;
