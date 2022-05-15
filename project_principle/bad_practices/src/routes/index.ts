import { userRoutes } from "./user-routes";

export const routes = {
  ...userRoutes
}

export type RoutesType = keyof typeof routes;