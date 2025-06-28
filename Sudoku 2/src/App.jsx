import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppHeader } from './cmps/AppHeader'
import { Board } from './pages/Board'
import { store } from './store/store'

function App() {

  return (
    <>
      <Provider store={store}>
        <AppHeader />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Board />} />
          </Routes>
        </BrowserRouter>
      </Provider>

    </>
  )
}

export default App
