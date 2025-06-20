import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Board } from './pages/Board'
import { store } from './store/store'
import { Provider } from 'react-redux'

function App() {

  return (
    <>
        <Provider store={store}>
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
