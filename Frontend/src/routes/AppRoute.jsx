import {RouterProvider} from "react-router-dom";
import {router} from "./../data/Router";

const AppRoute = () => {
  return <RouterProvider router={router} />;
};

export default AppRoute;
