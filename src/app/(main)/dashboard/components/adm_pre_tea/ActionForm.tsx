import { useState } from "react";
import { FormsObj } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";

// Definición de los tipos de datos
interface ActionFormProps {
  action: keyof FormsObj; // Solo las claves definidas en FormsObj
  onBack: () => void;
  onClose: () => void;
}

// Objeto de formularios
const formsObj: FormsObj = {
  "Crear mensaje": {
    title: "",
    message: "",
    courses: "",
  },
};

export const ActionForm = ({ action, onBack, onClose }: ActionFormProps) => {
  // Inicializamos el estado con los datos del formulario según la acción
  const [formData, setFormData] = useState<FormsObj[typeof action]>(
    formsObj[action]
  );
  const [isLoading, setIsLoading] = useState(false); // Para manejar el estado de carga

  const handleSubmit = async () => {
    setIsLoading(true); // Activa el estado de carga

    try {
      // Realiza la solicitud POST directamente a la API externa
      const response = await axios.post(
        "http://localhost:8080/api/v1/messages/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Si necesitas enviar cookies con la solicitud
        }
      );

      if (response.status === 201) {
        console.log("Mensaje enviado correctamente");
        onClose(); // Cierra el formulario al enviar el mensaje
      } else {
        console.error("Error al enviar el mensaje");
        alert("Error al enviar el mensaje");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error de Axios:", error.response?.data || error.message);
        alert(
          `Error al enviar el mensaje: ${error.response?.data || error.message}`
        );
      } else {
        console.error("Error desconocido:", error);
        alert("Error al enviar el mensaje: Error desconocido");
      }
    } finally {
      setIsLoading(false); // Desactiva el estado de carga
    }
  };

  // Función para manejar los cambios de los inputs
  const handleChange = <K extends keyof FormsObj[typeof action]>(
    field: K,
    value: string
  ) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{action}</h2>

      {/* Renderizamos los inputs según las claves de formData */}
      {Object.keys(formData).map((key) => {
        const typedKey = key as keyof FormsObj[typeof action]; // Aseguramos que key sea del tipo correcto
        return (
          <div key={key}>
            <Input
              placeholder={typedKey.charAt(0).toUpperCase() + typedKey.slice(1)} // Capitalizamos la primera letra de la clave
              value={formData[typedKey]} // Accedemos al valor correctamente tipado
              onChange={(e) => handleChange(typedKey, e.target.value)} // Llamamos a handleChange con el tipo adecuado
            />
          </div>
        );
      })}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Enviando..." : "Crear"}
        </Button>
      </div>
    </div>
  );
};
