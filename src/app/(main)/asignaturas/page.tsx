import SubjectSelector from "./components/SubjectSelector";

export default function Asignaturas() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Asignaturas</h1>
      </div>

      <SubjectSelector />
    </div>
  );
}
