import axios from "axios";
import { cookies } from "next/headers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  title: string;
  message: string;
  courses: string;
  sender_id: number;
}

interface Sender {
  id: number;
  full_name: string;
  photo: string | null;
}

export default async function Mensajes() {
  const cookiesData = await cookies();
  const token = cookiesData.get("jwt")?.value;

  let messages: Message[] = [];

  try {
    const res = await axios.get("http://localhost:8080/api/v1/messages/", {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${token}`,
      },
    });

    if (res.status === 200) {
      messages = res.data;
    }
  } catch (error) {
    console.error("Error al obtener los mensajes:", error);
    return <p className="text-red-500">Error al cargar mensajes.</p>;
  }

  const uniqueSenderIds = [...new Set(messages.map((msg) => msg.sender_id))];
  const sendersMap = new Map<number, Sender>();

  for (const senderId of uniqueSenderIds) {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/v1/public_personal_data/?user_id=${senderId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Cookie: `jwt=${token}`,
          },
        }
      );

      if (res.data) {
        const senderData: Sender = {
          id: senderId,
          full_name: res.data.full_name || "Usuario",
          photo: res.data.photo || null,
        };

        sendersMap.set(senderId, senderData);
      }
    } catch (error) {
      console.error(`Error al obtener datos del remitente ${senderId}:`, error);
      sendersMap.set(senderId, {
        id: senderId,
        full_name: "Usuario Desconocido",
        photo: null,
      });
    }
  }

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Mensajes</h1>

      {messages.length > 0 ? (
        <div className="flex flex-col space-y-4">
          {messages.map((message) => {
            const sender = sendersMap.get(message.sender_id);
            const initials = sender ? getInitials(sender.full_name) : "??";

            return (
              <div
                key={message.id}
                className="flex items-start p-4 bg-card rounded-lg shadow-sm border border-border hover:shadow-md transition"
              >
                <Avatar className="h-12 w-12 mr-4">
                  {sender?.photo ? (
                    <AvatarImage src={sender.photo} alt={sender.full_name} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-card-foreground">
                        {sender?.full_name || "Usuario Desconocido"}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {message.sender_id}
                    </div>
                  </div>

                  <div className="mt-1">
                    <p className="font-semibold text-card-foreground mb-1">
                      {message.title}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {message.message}
                    </p>
                    {message.courses && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Cursos: {message.courses}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-lg">
            No hay mensajes disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
