
import AuthPage from './components/AuthPage'
import './App.css'
import { Route, Routes, Navigate } from 'react-router-dom'
import ProfilePreview from './components/ProfilePreview'
import ProfilePage from './components/ProfilePage'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path='/auth' element={<AuthPage />}/>
      <Route path='/auth/preview' element={<ProfilePreview/>}/>
      <Route path='/ProfilePage' element={<ProfilePage/>}/>
    </Routes>
  )
}

export default App
