import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppHeader } from './cmps/AppHeader'
import { Home } from './pages/Home'
import { store } from './store/store'

function App() {

  return (
    <>
      <Provider store={store}>
        <AppHeader />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </Provider>

    </>
  )
}

export default App
