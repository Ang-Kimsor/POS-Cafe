import {
    createBrowserRouter,
    Navigate,
} from "react-router-dom";
import { AdminLayout, CashierLayout } from "../layouts";
import ProtectedRoute from "../routes/ProtectedRoute";
import {
    NotFound,
    Login,
    Dashboard,
    POSCashier,
    Product,
    Category,
    POSAdmin,
    Cashier,
    Admin,
    Order,
    Setting,
    SalesReport,
    ProductReport,
    Size,
    HistoryCashier
} from "../pages";
export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to={"/login"} />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/logout",
        element: <Navigate to="/login" replace />,
    },
    // Admin
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            {
                element: <ProtectedRoute role={"admin"} />,
                children: [
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                    {
                        path: "pos",
                        element: <POSAdmin />,
                    },
                    {
                        path: "products",
                        element: <Product.ViewAll />,
                    },
                    {
                        path: "products/add",
                        element: <Product.Create />,
                    },
                    {
                        path: "products/update/:id",
                        element: <Product.Update />,
                    },
                    {
                        path: "products/view/:id",
                        element: <Product.ViewEach />,
                    },
                    {
                        path: "categories",
                        element: <Category.ViewAll />,
                    },
                    {
                        path: "categories/add",
                        element: <Category.Create />,
                    },
                    {
                        path: "categories/update/:id",
                        element: <Category.Update />,
                    },
                    {
                        path: "categories/view/:id",
                        element: <Category.ViewEach />,
                    },
                    {
                        path: "sizes",
                        element: <Size.ViewAll />,
                    },
                    {
                        path: "sizes/add",
                        element: <Size.Create />,
                    },
                    {
                        path: "sizes/update/:id",
                        element: <Size.Update />,
                    },
                    // Cashier CRUD
                    { path: "cashiers", element: <Cashier.ViewAll /> },
                    { path: "cashiers/add", element: <Cashier.Create /> },
                    { path: "cashiers/update/:id", element: <Cashier.Update /> },
                    { path: "cashiers/view/:id", element: <Cashier.ViewEach /> },
                    { path: "staffs", element: <Navigate to="/admin/cashiers" replace /> },

                    { path: "orders", element: <Order.ViewAll /> },
                    {
                        element: <ProtectedRoute role="superadmin" />,
                        children: [
                            // Admin CRUD (Superadmin only)
                            { path: "admins", element: <Admin.ViewAll /> },
                            { path: "admins/add", element: <Admin.Create /> },
                            { path: "admins/update/:id", element: <Admin.Update /> },
                            { path: "admins/view/:id", element: <Admin.ViewEach /> },

                            { path: "settings", element: <Setting.ViewAll /> },
                            // { path: "settings/add", element: <Setting.Create /> },
                            { path: "settings/update/:id", element: <Setting.Update /> },
                            { path: "settings/view/:id", element: <Setting.ViewEach /> },
                        ]
                    },
                    { path: "reports/sales", element: <SalesReport /> },
                    { path: "reports/products", element: <ProductReport /> },
                ],
            },
        ],
    },
    // Cashier
    {
        path: "/cashier",
        element: <CashierLayout />,
        children: [
            {
                element: <ProtectedRoute role="cashier" />,
                children: [
                    {
                        index: true,
                        element: <POSCashier />,
                    },
                    {
                        path: "history",
                        element: <HistoryCashier />,
                    },
                    {
                        path: "*",
                        element: <POSCashier />,
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
]);