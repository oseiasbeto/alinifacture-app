import authentication from '../views/authentication/routes'
import landingPage from '../views/landingPage/routes'
import dashboard from '../views/dashboard/routes'

export default [
    ...authentication,
    ...landingPage,
    ...dashboard
]