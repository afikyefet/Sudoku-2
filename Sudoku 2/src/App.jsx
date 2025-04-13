import './App.css'
import { Board } from './pages/Board'

function App() {

  return (
    <>
      <Router>
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Board />} />
            </Routes>
          </BrowserRouter>
        </Provider>
      </Router>

    </>
  )
}

export default App
