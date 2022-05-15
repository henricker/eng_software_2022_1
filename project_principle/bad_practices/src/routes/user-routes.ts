import { userController } from '../controllers/user-controller';

export const userRoutes = {
  '^GET \\/users$': userController.index,
  '^POST \\/users$': userController.store,
  '^GET \\/users\\/\\d$': userController.show,
  '^PUT \\/users\\/\\d$': userController.update,
  '^DELETE \\/users\\/\\d$': userController.destroy
}