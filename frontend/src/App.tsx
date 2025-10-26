import './App.css'
import {Routes,Route} from "react-router-dom"
import Homepage from './components/pages/Homepage'
import Login from './components/pages/login'
import AdminPanel from './components/pages/AdminPanel'
import UserPanel from './components/pages/UserPanel'
import Users from './components/pages/users'

function App() {

  return (
    <>
       <Routes>
        <Route path='/' element={<Homepage/>} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/adminPanel" element={<AdminPanel/>}/>
        <Route path="/userPanel" element={<UserPanel/>}/>
        <Route path="/users" element={<Users/>}/>
      </Routes>
    </>
  )
}

export default App
