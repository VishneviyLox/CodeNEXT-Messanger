
import AuthPage from './components/AuthPage'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import ProfilePreview from './components/ProfilePreview'

function App() {

  return (
    <Routes>
      <Route path='/auth' element={<AuthPage />}/>
      <Route path='/auth/preview' element={<ProfilePreview/>}/>
    </Routes>
  )
}

export default App
