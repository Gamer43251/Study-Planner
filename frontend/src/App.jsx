import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ModuleDetailPage from "./pages/ModuleDetailPage";
import ModuleFormPage from "./pages/ModuleFormPage";
import ModuleListPage from "./pages/ModuleListPage";
import TaskFormPage from "./pages/TaskFormPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ModuleListPage />} />
        <Route path="modules/new" element={<ModuleFormPage />} />
        <Route path="modules/:moduleId/edit" element={<ModuleFormPage />} />
        <Route path="modules/:moduleId/tasks/new" element={<TaskFormPage />} />
        <Route path="modules/:moduleId" element={<ModuleDetailPage />} />
        <Route path="tasks/:taskId/edit" element={<TaskFormPage />} />
      </Route>
    </Routes>
  );
}
