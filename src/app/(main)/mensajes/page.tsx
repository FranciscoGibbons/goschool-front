import axios from "axios";
import { cookies } from "next/headers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  title: string;
  message: string;
  courses: string;
}

export default async function Mensajes() {
  const cookiesData = await cookies();
  const token = cookiesData.get("jwt")?.value;

  let messages: Message[] = [];

  try {
    const res = await axios.get(
      "http://localhost:8080/api/v1/get_messages/0/",
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Cookie: `jwt=${token}`,
        },
      }
    );

    if (res.status === 200) {
      messages = res.data;
    }
  } catch (error) {
    console.error("Error al obtener los mensajes:", error);
  }

  // Función para mockear datos
  const getMockSender = (index: number) => {
    const mockNames = [
      { name: "Guillermina Cererols", role: "Preceptor" },
      { name: "Pamela Valentina Barón", role: "Director" },
      { name: "Carlos Fernández", role: "Preceptor" },
      { name: "Laura Martínez", role: "Director" },
    ];
    return mockNames[index % mockNames.length];
  };

  return (
    <div className="h-full w-full p-6 overflow-hidden flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Mensajes</h1>

      {messages.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => {
              const mock = getMockSender(index);

              return (
                <div
                  key={message.id}
                  className="flex items-start p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition"
                >
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarFallback>
                      {mock.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{mock.name}</p>
                        <p className="text-sm text-blue-600">{mock.role}</p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="font-semibold text-gray-900 truncate">
                        {message.title}
                      </p>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">
            No hay mensajes disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
