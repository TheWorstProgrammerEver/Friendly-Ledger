import { Navigate } from 'react-router-dom'
import { AuthPanel } from '../../components/AuthPanel/AuthPanel'
import { useAuthScreenViewModel } from './useAuthScreenViewModel'
import styles from './AuthScreen.module.scss'

export const AuthScreen = () => {
  const viewModel = useAuthScreenViewModel()

  if (viewModel.signedIn) {
    return <Navigate to="/" replace />
  }

  return (
    <main className={styles.screen}>
      <AuthPanel onSubmit={viewModel.signIn} />
    </main>
  )
}
