import authentication from '../views/authentication/routes'
import dashboard from '../views/dashboard/routes'

export default [
    ...authentication,
    ...dashboard
]