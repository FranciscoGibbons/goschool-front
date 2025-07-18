import MessageList from "./components/MessageList";

export default function Mensajes() {
  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Mensajes</h1>
      <MessageList />
    </div>
  );
}
