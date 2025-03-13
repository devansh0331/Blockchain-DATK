import { Route, Routes } from "react-router-dom";
import TodoList from "./components/TodoList";

function App() {
  return (
    <div className="bg-off">
      <div className="">
        <Routes>
          <Route path="/" element={<TodoList />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
